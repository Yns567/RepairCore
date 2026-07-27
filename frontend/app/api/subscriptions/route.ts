import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InsufficientBalanceError, debitWallet } from "@/lib/wallet";

const planRequestSchema = z.object({ planId: z.coerce.number().int().positive() });

const periodToDays: Record<string, number> = {
  MONTHLY: 30,
  YEARLY: 365,
  RENTAL_DAY: 1,
  RENTAL_WEEK: 7,
};

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const parsed = planRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid subscription plan." }, { status: 400 });
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.planId } });
  if (!plan || plan.status !== "ACTIVE") {
    return NextResponse.json({ error: "This plan is no longer available." }, { status: 404 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findFirst({
        where: { userId, planId: plan.id, status: { in: ["PENDING", "ACTIVE"] } },
        orderBy: { createdAt: "desc" },
      });
      if (existing) return { subscription: existing, existing: true };

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(now.getDate() + (periodToDays[plan.billingPeriod] ?? 30));
      const subscription = await tx.subscription.create({
        data: { userId, planId: plan.id, status: "PENDING", startDate: now, endDate },
      });

      await debitWallet(tx, {
        userId,
        amount: Number(plan.price),
        description: `Payment for ${plan.name}`,
        referenceType: "SUBSCRIPTION",
        referenceId: String(subscription.id),
      });

      return { subscription, existing: false };
    });

    return NextResponse.json(result, { status: result.existing ? 200 : 201 });
  } catch (error) {
    if (error instanceof InsufficientBalanceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "We could not create this subscription request." }, { status: 400 });
  }
}
