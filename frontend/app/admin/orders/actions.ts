"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { creditWallet } from "@/lib/wallet";

const validStatuses = new Set(["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"]);

export async function updateOrderStatus(orderId: number, status: string) {
  const session = await requireAdmin();
  const adminId = session?.user?.id;
  if (!Number.isSafeInteger(orderId) || orderId < 1 || !validStatuses.has(status)) {
    throw new Error("Invalid order update.");
  }

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      throw new Error("Order not found.");
    }

    // CANCELLED is terminal: stock was released and any balance payment refunded.
    if (order.status === "CANCELLED") {
      if (status !== "CANCELLED") {
        throw new Error("A cancelled order cannot be reopened. Create a new order instead.");
      }
      return;
    }

    if (status !== "CANCELLED") {
      await tx.order.update({ where: { id: order.id }, data: { status } });
      return;
    }

    // Claim the cancellation atomically so concurrent admins cannot refund/restock twice.
    const claim = await tx.order.updateMany({
      where: { id: order.id, status: { not: "CANCELLED" } },
      data: { status: "CANCELLED" },
    });
    if (claim.count !== 1) {
      return;
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
        amount: order.total,
        type: "REFUND",
        description: `Refund for cancelled order #${order.id}`,
        referenceType: "ORDER",
        referenceId: String(order.id),
        createdById: adminId,
      });
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/wallets");
  revalidatePath("/orders");
  revalidatePath("/account/wallet");
  revalidatePath("/store");
}
