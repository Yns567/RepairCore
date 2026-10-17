"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { emailHtml, notify, siteUrl } from "@/lib/email";
import { formatMoney, isCurrency } from "@/lib/money";
import { awardCashback, reverseCashback } from "@/lib/loyalty";
import { creditWallet } from "@/lib/wallet";

const deliverOrderSchema = z.object({
  id: z.coerce.number().int().positive(),
  deliveryNote: z.string().trim().max(4000),
});

/** Saves a delivery message/code for an order and emails it to the customer. */
export async function deliverOrder(formData: FormData) {
  await requireAdmin();
  const parsed = deliverOrderSchema.safeParse({ id: formData.get("id"), deliveryNote: formData.get("deliveryNote") });
  if (!parsed.success) throw new Error("Invalid delivery.");
  const { id, deliveryNote } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id }, select: { user: { select: { email: true } } } });
  if (!order) throw new Error("Order not found.");

  await prisma.order.update({ where: { id }, data: { deliveryNote: deliveryNote || null } });

  if (deliveryNote) {
    await notify({
      to: order.user.email,
      subject: `Your order #${id} is ready`,
      text: `Your digital product for order #${id}:\n\n${deliveryNote}\n\n${siteUrl()}/orders/${id}`,
      html: emailHtml(
        [`Your digital product for order #${id} is ready. Your details:`, deliveryNote],
        { label: "View order", url: `${siteUrl()}/orders/${id}` },
      ),
    });
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${id}`);
}

const statusLabels: Record<string, string> = {
  PENDING: "pending",
  PAID: "paid",
  SHIPPED: "shipped",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export async function updateOrderStatus(orderId: number, status: string) {
  const session = await requireAdmin();
  const adminId = session?.user?.id;
  if (!Number.isSafeInteger(orderId) || orderId < 1 || !(status in statusLabels)) {
    throw new Error("Invalid order update.");
  }

  const { before, cashback } = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { email: true } } },
    });
    if (!order) {
      throw new Error("Order not found.");
    }
    const cashback = await applyStatusChange(tx, order, status, adminId);
    return { before: order, cashback };
  });

  if (before.status !== status) {
    const refund = status === "CANCELLED" && before.paymentMethod === "BALANCE"
      ? ` ${formatMoney(before.total, before.currency)} was returned to your balance.`
      : "";
    const reward = cashback?.gt(0)
      ? ` You earned ${formatMoney(cashback, before.currency)} cashback in your balance.`
      : "";
    const line = `Your order #${orderId} is now ${statusLabels[status]}.${refund}${reward}`;
    await notify({
      to: before.user.email,
      subject: `Order #${orderId}: ${statusLabels[status]}`,
      text: `${line}\n${siteUrl()}/orders/${orderId}`,
      html: emailHtml([line], { label: "View order", url: `${siteUrl()}/orders/${orderId}` }),
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/wallets");
  revalidatePath("/orders");
  revalidatePath("/account/wallet");
  revalidatePath("/store");
  revalidatePath("/account");
}

async function applyStatusChange(
  tx: Prisma.TransactionClient,
  order: Prisma.OrderGetPayload<{ include: { items: true } }>,
  status: string,
  adminId: string | undefined,
) {
  // CANCELLED is terminal: stock was released and any balance payment refunded.
  if (order.status === "CANCELLED") {
    if (status !== "CANCELLED") {
      throw new Error("A cancelled order cannot be reopened. Create a new order instead.");
    }
    return null;
  }

  if (status !== "CANCELLED") {
    await tx.order.update({ where: { id: order.id }, data: { status } });
    // Completing an order pays the loyalty cashback (once, even if set again later).
    if (status === "COMPLETED") {
      return awardCashback(tx, {
        userId: order.userId,
        sourceType: "ORDER",
        sourceId: order.id,
        currency: order.currency,
        amount: order.total,
        label: `order #${order.id}`,
      });
    }
    return null;
  }

  // Claim the cancellation atomically so concurrent admins cannot refund/restock twice.
  const claim = await tx.order.updateMany({
    where: { id: order.id, status: { not: "CANCELLED" } },
    data: { status: "CANCELLED" },
  });
  if (claim.count !== 1) {
    return null;
  }

  for (const item of order.items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity }, version: { increment: 1 } },
    });
  }

  // Balance orders are debited at checkout, so cancelling them returns the money.
  if (order.paymentMethod === "BALANCE") {
    await creditWallet(tx, {
      userId: order.userId,
      currency: isCurrency(order.currency) ? order.currency : "USD",
      amount: order.total,
      type: "REFUND",
      description: `Refund for cancelled order #${order.id}`,
      referenceType: "ORDER",
      referenceId: String(order.id),
      createdById: adminId,
    });
  }

  // A completed order that gets cancelled loses the cashback it earned.
  await reverseCashback(tx, { sourceType: "ORDER", sourceId: order.id, label: `order #${order.id}`, createdById: adminId });
  return null;
}
