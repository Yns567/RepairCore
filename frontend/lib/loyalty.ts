import "server-only";

import type { Prisma } from "@/lib/generated/prisma";
import { type Currency, Decimal, isCurrency, toMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { creditWallet, debitWallet } from "@/lib/wallet";

/**
 * Loyalty levels by lifetime points. `rate` is the cashback percentage paid into the
 * customer's balance on every completed purchase. Change the numbers here to tune it.
 */
export const LOYALTY_TIERS = [
  { id: "BRONZE", minPoints: 0, rate: 1 },
  { id: "SILVER", minPoints: 500, rate: 2 },
  { id: "GOLD", minPoints: 2_500, rate: 3 },
  { id: "PLATINUM", minPoints: 10_000, rate: 4 },
] as const;

export type LoyaltyTier = (typeof LOYALTY_TIERS)[number];
export type LoyaltyTierId = LoyaltyTier["id"];
export const MAX_CASHBACK_RATE = LOYALTY_TIERS[LOYALTY_TIERS.length - 1].rate;

// Points measure progress in dirham. USD purchases count at a fixed approximate rate:
// this only moves customers between levels and never converts any money.
const POINTS_PER_UNIT: Record<Currency, number> = { MAD: 1, USD: 10 };

export type RewardSource = "ORDER" | "GSM_SERVICE_ORDER" | "SUBSCRIPTION";

type Client = Prisma.TransactionClient | typeof prisma;

export function loyaltyStatus(points: number) {
  let index = 0;
  LOYALTY_TIERS.forEach((tier, i) => {
    if (points >= tier.minPoints) index = i;
  });
  const tier = LOYALTY_TIERS[index];
  const next = LOYALTY_TIERS[index + 1] ?? null;
  return {
    tier,
    next,
    points,
    pointsToNext: next ? next.minPoints - points : 0,
    progress: next ? (points - tier.minPoints) / (next.minPoints - tier.minPoints) : 1,
  };
}

async function lifetimePoints(client: Client, userId: string) {
  const sum = await client.loyaltyReward.aggregate({ where: { userId, reversedAt: null }, _sum: { points: true } });
  return sum._sum.points ?? 0;
}

/** Level, progress and cashback earned so far, for the account and rewards pages. */
export async function getLoyalty(userId: string) {
  const [points, earned, recent] = await Promise.all([
    lifetimePoints(prisma, userId),
    prisma.loyaltyReward.groupBy({
      by: ["currency"],
      where: { userId, reversedAt: null },
      _sum: { amount: true },
    }),
    prisma.loyaltyReward.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  return {
    ...loyaltyStatus(points),
    earned: earned
      .filter((row) => row._sum.amount && row._sum.amount.gt(0))
      .map((row) => ({ currency: row.currency, amount: row._sum.amount! })),
    recent,
  };
}

/** Cashback rate the user would get on their next purchase (the base rate for guests). */
export async function cashbackRateFor(userId: string | undefined) {
  if (!userId) return LOYALTY_TIERS[0].rate;
  return loyaltyStatus(await lifetimePoints(prisma, userId)).tier.rate;
}

export function cashbackAmount(amount: Prisma.Decimal.Value, rate: number) {
  return toMoney(amount).times(rate).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_DOWN);
}

/**
 * Pays cashback for a completed purchase into the wallet of the same currency.
 * Run it in the transaction that marks the purchase completed. Calling it again for the
 * same purchase does nothing, because the reward row is claimed with ON CONFLICT DO NOTHING.
 */
export async function awardCashback(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    sourceType: RewardSource;
    sourceId: string | number;
    currency: string;
    amount: Prisma.Decimal.Value;
    label: string;
  },
) {
  if (!isCurrency(input.currency)) return null;
  const base = toMoney(input.amount);
  if (!base.isFinite() || base.lte(0)) return null;

  const sourceId = String(input.sourceId);
  // The level is decided by what was earned before this purchase.
  const { tier } = loyaltyStatus(await lifetimePoints(tx, input.userId));
  const cashback = cashbackAmount(base, tier.rate);

  const claim = await tx.loyaltyReward.createMany({
    data: [
      {
        userId: input.userId,
        sourceType: input.sourceType,
        sourceId,
        currency: input.currency,
        baseAmount: base,
        rate: tier.rate,
        amount: cashback,
        points: Math.floor(base.times(POINTS_PER_UNIT[input.currency]).toNumber()),
      },
    ],
    skipDuplicates: true,
  });
  if (claim.count !== 1) return null;

  if (cashback.gt(0)) {
    await creditWallet(tx, {
      userId: input.userId,
      currency: input.currency,
      amount: cashback,
      type: "CREDIT",
      description: `Cashback ${tier.rate}% for ${input.label}`,
      referenceType: "CASHBACK",
      referenceId: `${input.sourceType}:${sourceId}`,
    });
  }
  return cashback;
}

/**
 * Takes the cashback back when a completed purchase is cancelled and refunded.
 * Never takes more than the current balance, so the wallet cannot go negative.
 */
export async function reverseCashback(
  tx: Prisma.TransactionClient,
  input: { sourceType: RewardSource; sourceId: string | number; label: string; createdById?: string },
) {
  const sourceId = String(input.sourceId);
  const reward = await tx.loyaltyReward.findUnique({
    where: { sourceType_sourceId: { sourceType: input.sourceType, sourceId } },
  });
  if (!reward || reward.reversedAt) return;

  const claim = await tx.loyaltyReward.updateMany({
    where: { id: reward.id, reversedAt: null },
    data: { reversedAt: new Date() },
  });
  if (claim.count !== 1 || reward.amount.lte(0) || !isCurrency(reward.currency)) return;

  const wallet = await tx.wallet.findUnique({
    where: { userId_currency: { userId: reward.userId, currency: reward.currency } },
  });
  const amount = Decimal.min(reward.amount, wallet?.balance ?? 0);
  if (amount.lte(0)) return;

  await debitWallet(tx, {
    userId: reward.userId,
    currency: reward.currency,
    amount,
    description: `Cashback reversed for cancelled ${input.label}`,
    referenceType: "CASHBACK",
    referenceId: `${input.sourceType}:${sourceId}`,
    createdById: input.createdById,
  });
}
