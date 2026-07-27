"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";

export async function updateOrderStatus(orderId: number, status: string) {
  await requireAdmin();
  const validStatuses = new Set(["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"]);
  if (!Number.isSafeInteger(orderId) || orderId < 1 || !validStatuses.has(status)) {
    throw new Error("Invalid order update.");
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
