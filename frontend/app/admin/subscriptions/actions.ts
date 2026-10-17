"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { emailHtml, notify, siteUrl } from "@/lib/email";
import { PRICING_CURRENCY } from "@/lib/money";
import type { Prisma } from "@/lib/generated/prisma";
import { awardCashback } from "@/lib/loyalty";
import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";

const validStatuses = new Set(["PENDING", "ACTIVE", "CANCELLED", "EXPIRED"]);
const periodToDays: Record<string, number> = { MONTHLY: 30, YEARLY: 365, RENTAL_DAY: 1, RENTAL_WEEK: 7 };

/** Pays the loyalty cashback when a paid subscription request is activated. */
async function rewardSubscription(
  tx: Prisma.TransactionClient,
  subscription: { id: number; userId: string; plan: { name: string } },
) {
  const payment = await tx.walletTransaction.findFirst({
    where: { referenceType: "SUBSCRIPTION", referenceId: String(subscription.id), type: "DEBIT" },
  });
  if (!payment) return;
  await awardCashback(tx, {
    userId: subscription.userId,
    sourceType: "SUBSCRIPTION",
    sourceId: subscription.id,
    currency: PRICING_CURRENCY.subscription,
    amount: payment.amount,
    label: `${subscription.plan.name} subscription`,
  });
}

const deliverSchema = z.object({
  id: z.coerce.number().int().positive(),
  deliveryNote: z.string().trim().min(1, "Enter the activation code or details.").max(4000),
});

/** Saves the activation details, activates the subscription and emails the customer. */
export async function deliverSubscription(formData: FormData) {
  const session = await requireAdmin();
  const adminId = session?.user?.id;
  const parsed = deliverSchema.safeParse({ id: formData.get("id"), deliveryNote: formData.get("deliveryNote") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid delivery.");
  const { id, deliveryNote } = parsed.data;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: { plan: true, user: { select: { email: true } } },
  });
  if (!subscription) throw new Error("Subscription not found.");
  if (subscription.status === "CANCELLED") throw new Error("This subscription was cancelled.");

  const now = new Date();
  // Delivering the activation also starts the subscription period if still pending.
  const activate = subscription.status === "PENDING";
  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id },
      data: {
        deliveryNote,
        ...(activate
          ? {
              status: "ACTIVE",
              startDate: now,
              endDate: new Date(now.getTime() + (periodToDays[subscription.plan.billingPeriod] ?? 30) * 86_400_000),
            }
          : {}),
      },
    });
    if (activate) await rewardSubscription(tx, subscription);
  });

  await notify({
    to: subscription.user.email,
    subject: `Your ${subscription.plan.name} is ready`,
    text: `Your ${subscription.plan.name} subscription is active.\n\n${deliveryNote}\n\n${siteUrl()}/account/subscriptions`,
    html: emailHtml(
      [`Your ${subscription.plan.name} subscription is active. Your activation details:`, deliveryNote],
      { label: "View my subscriptions", url: `${siteUrl()}/account/subscriptions` },
    ),
  });

  void adminId;
  revalidatePath("/admin/subscriptions");
  revalidatePath("/account/subscriptions");
  revalidatePath("/account/wallet");
}

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

    if (subscription.status === "PENDING" && status === "ACTIVE") {
      await rewardSubscription(tx, subscription);
    }

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
