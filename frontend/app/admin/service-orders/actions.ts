"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";

const refundableStatuses = new Set(["REJECTED", "CANCELLED"]);

const updateOrderSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "REJECTED", "CANCELLED"]),
  result: z.string().trim().max(2_000).transform((value) => value || null),
});

export async function updateGsmServiceOrder(formData: FormData) {
  const session = await requireAdmin();
  const adminId = session?.user?.id;
  if (!adminId) {
    throw new Error("Admin session is required.");
  }

  const parsed = updateOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    result: formData.get("result"),
  });
  if (!parsed.success) {
    throw new Error("Enter a valid order status and a result of at most 2,000 characters.");
  }

  const { orderId, status, result } = parsed.data;
  const refundRequested = refundableStatuses.has(status);

  await prisma.$transaction(async (tx) => {
    const order = await tx.gsmServiceOrder.findUnique({
      where: { id: orderId },
      include: { service: { select: { name: true } } },
    });
    if (!order) {
      throw new Error("Service order not found.");
    }

    if (order.refundedAt) {
      if (!refundRequested) {
        throw new Error("A refunded order cannot be returned to a non-refunded status.");
      }

      await tx.gsmServiceOrder.update({
        where: { id: order.id },
        data: { status, result },
      });
      return;
    }

    if (refundRequested) {
      const refundClaim = await tx.gsmServiceOrder.updateMany({
        where: { id: order.id, refundedAt: null },
        data: { status, result, refundedAt: new Date() },
      });

      if (refundClaim.count === 1) {
        await creditWallet(tx, {
          userId: order.userId,
          amount: Number(order.price),
          type: "REFUND",
          description: `Refund for GSM service order #${order.id}: ${order.service.name}`,
          referenceType: "GSM_SERVICE_ORDER",
          referenceId: String(order.id),
          createdById: adminId,
        });
        return;
      }

      // Another administrator may have completed the refund while this
      // transaction was waiting. Keep the terminal status/result editable,
      // but never create a second balance entry.
      const latestOrder = await tx.gsmServiceOrder.findUnique({
        where: { id: order.id },
        select: { refundedAt: true },
      });
      if (!latestOrder?.refundedAt) {
        throw new Error("The order changed while it was being updated. Please retry.");
      }

      await tx.gsmServiceOrder.update({
        where: { id: order.id },
        data: { status, result },
      });
      return;
    }

    const update = await tx.gsmServiceOrder.updateMany({
      where: { id: order.id, refundedAt: null },
      data: { status, result },
    });
    if (update.count !== 1) {
      throw new Error("This order was refunded and can no longer return to a non-refunded status.");
    }
  });

  revalidatePath("/admin/service-orders");
  revalidatePath("/admin/wallets");
  revalidatePath("/account");
  revalidatePath("/account/services");
  revalidatePath("/account/wallet");
}
