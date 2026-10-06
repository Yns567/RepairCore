"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { CURRENCIES, MONEY_PATTERN, toMoney } from "@/lib/money";
import { getT } from "@/lib/i18n/server";
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
  const { t } = await getT();
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { status: "error", message: t("topup.errAuth") };

  const parsed = topUpSchema.safeParse({
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    bank: formData.get("bank"),
    reference: formData.get("reference") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: t("topup.errFields") };
  }

  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: t("topup.errReceipt") };
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return { status: "error", message: t("topup.errSize") };
  }
  const receipt = new Uint8Array(await file.arrayBuffer());
  const receiptType = detectReceiptType(receipt);
  if (!receiptType) {
    return { status: "error", message: t("topup.errType") };
  }

  const pending = await prisma.topUpRequest.count({ where: { userId, status: "PENDING" } });
  if (pending >= MAX_PENDING_TOP_UPS) {
    return { status: "error", message: t("topup.errPending") };
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
  return { status: "success", message: t("topup.sent") };
}
