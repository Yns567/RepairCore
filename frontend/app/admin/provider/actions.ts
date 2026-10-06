"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authorization";
import { refreshProviderOrders, submitOrderToProvider, syncProviderServices } from "@/lib/gsm-provider";
import { prisma } from "@/lib/prisma";

export async function syncServicesAction() {
  await requireAdmin();
  let message: string;
  try {
    const summary = await syncProviderServices();
    message = `Synced: ${summary.created} new, ${summary.updated} updated, ${summary.blocked} blocked, ${summary.deactivated} deactivated.`;
  } catch (error) {
    message = `Sync failed: ${error instanceof Error ? error.message : "unknown error"}`;
  }
  revalidatePath("/admin/provider");
  revalidatePath("/admin/services");
  revalidatePath("/services");
  redirect(`/admin/provider?message=${encodeURIComponent(message)}`);
}

export async function retrySubmissionAction(formData: FormData) {
  await requireAdmin();
  const orderId = Number(formData.get("orderId"));
  if (!Number.isSafeInteger(orderId) || orderId < 1) throw new Error("Invalid order.");
  await prisma.gsmServiceOrder.update({ where: { id: orderId }, data: { submitError: null } });
  await submitOrderToProvider(orderId);
  revalidatePath("/admin/provider");
  revalidatePath("/admin/service-orders");
}

export async function refreshStatusesAction() {
  await requireAdmin();
  await refreshProviderOrders({}, 50);
  revalidatePath("/admin/provider");
  revalidatePath("/admin/service-orders");
}
