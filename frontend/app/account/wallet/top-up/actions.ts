"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { CURRENCIES, MONEY_PATTERN, toMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { detectReceiptType, MAX_PENDING_TOP_UPS, MAX_RECEIPT_BYTES, TOP_UP_BANKS, type TopUpBank } from "@/lib/top-up";

export type TopUpState = { status: "idle" | "success" | "error"; message?: string };

const topUpSchema = z.object({
  currency: z.enum(CURRENCIES),
  amount: z.string().trim().regex(MONEY_PATTERN).refine((value) => {
    const amount = toMoney(value);
    return amount.gt(0) && amount.lte(100_000);
  }),
  bank: z.enum(Object.keys(TOP_UP_BANKS) as [TopUpBank, ...TopUpBank[]]),
  reference: z.string().trim().max(120).transform((value) => value || null),
});

export async function submitTopUp(_previous: TopUpState, formData: FormData): Promise<TopUpState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { status: "error", message: "Please sign in again." };

  const parsed = topUpSchema.safeParse({
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    bank: formData.get("bank"),
    reference: formData.get("reference") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid amount (max 2 decimals), currency and bank." };
  }

  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Attach a photo or PDF of your transfer receipt." };
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return { status: "error", message: "The receipt must be 3 MB or smaller." };
  }
  const receipt = new Uint8Array(await file.arrayBuffer());
  const receiptType = detectReceiptType(receipt);
  if (!receiptType) {
    return { status: "error", message: "The receipt must be a JPG, PNG, WEBP or PDF file." };
  }

  const pending = await prisma.topUpRequest.count({ where: { userId, status: "PENDING" } });
  if (pending >= MAX_PENDING_TOP_UPS) {
    return { status: "error", message: "You already have requests waiting for review. Please wait for them first." };
  }

  await prisma.topUpRequest.create({
    data: {
      userId,
      currency: parsed.data.currency,
      amount: toMoney(parsed.data.amount),
      method: "BANK_TRANSFER",
      bank: parsed.data.bank,
      reference: parsed.data.reference,
      receipt,
      receiptType,
    },
  });

  revalidatePath("/account/wallet");
  revalidatePath("/admin/top-ups");
  return { status: "success", message: "Request sent. Your balance is credited after we verify the transfer." };
}
