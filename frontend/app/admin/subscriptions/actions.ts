"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const validStatuses = new Set(["PENDING", "ACTIVE", "CANCELLED", "EXPIRED"]);
const periodToDays: Record<string, number> = { MONTHLY: 30, YEARLY: 365, RENTAL_DAY: 1, RENTAL_WEEK: 7 };

export async function updateSubscriptionStatus(subscriptionId: number, status: string) {
  await requireAdmin();
  if (!Number.isSafeInteger(subscriptionId) || subscriptionId < 1 || !validStatuses.has(status)) {
    throw new Error("Invalid subscription update.");
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });
  if (!subscription) throw new Error("Subscription not found.");

  const now = new Date();
  const data = status === "ACTIVE"
    ? {
        status,
        startDate: now,
        endDate: new Date(now.getTime() + (periodToDays[subscription.plan.billingPeriod] ?? 30) * 86_400_000),
      }
    : { status };

  await prisma.subscription.update({ where: { id: subscriptionId }, data });
  revalidatePath("/admin/subscriptions");
  revalidatePath("/account/subscriptions");
}
