"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authorization";
import { PRICING_CURRENCY } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";

const validStatuses = new Set(["PENDING", "ACTIVE", "CANCELLED", "EXPIRED"]);
const periodToDays: Record<string, number> = { MONTHLY: 30, YEARLY: 365, RENTAL_DAY: 1, RENTAL_WEEK: 7 };

export async function updateSubscriptionStatus(subscriptionId: number, status: string) {
  const session = await requireAdmin();
  const adminId = session?.user?.id;
  if (!Number.isSafeInteger(subscriptionId) || subscriptionId < 1 || !validStatuses.has(status)) {
    throw new Error("Invalid subscription update.");
  }

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });
    if (!subscription) throw new Error("Subscription not found.");
    if (subscription.status === "CANCELLED" && status !== "CANCELLED") {
      throw new Error("A cancelled subscription cannot be reopened.");
    }

    const now = new Date();
    const data = status === "ACTIVE"
      ? {
          status,
          startDate: now,
          endDate: new Date(now.getTime() + (periodToDays[subscription.plan.billingPeriod] ?? 30) * 86_400_000),
        }
      : { status };

    // Claim the transition so a refund can only ever happen once.
    const claim = await tx.subscription.updateMany({
      where: { id: subscriptionId, status: subscription.status },
      data,
    });
    if (claim.count !== 1) throw new Error("The subscription changed meanwhile. Please retry.");

    // Rejecting a request that was never activated returns what the customer paid.
    // Active subscriptions are not refunded automatically.
    if (subscription.status === "PENDING" && status === "CANCELLED") {
      const reference = { referenceType: "SUBSCRIPTION", referenceId: String(subscriptionId) };
      const [payment, refund] = await Promise.all([
        tx.walletTransaction.findFirst({ where: { ...reference, type: "DEBIT" } }),
        tx.walletTransaction.findFirst({ where: { ...reference, type: "REFUND" } }),
      ]);
      if (payment && !refund) {
        await creditWallet(tx, {
          userId: subscription.userId,
          currency: PRICING_CURRENCY.subscription,
          amount: payment.amount,
          type: "REFUND",
          description: `Refund for cancelled ${subscription.plan.name} request`,
          ...reference,
          createdById: adminId,
        });
      }
    }
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/account/subscriptions");
  revalidatePath("/account/wallet");
}
