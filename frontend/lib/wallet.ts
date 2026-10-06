import "server-only";

import type { Prisma } from "@/lib/generated/prisma";
import { toMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type WalletClient = Pick<typeof prisma, "wallet" | "walletTransaction">;

export class InsufficientBalanceError extends Error {
  constructor() {
    super("Your store balance is not enough to complete this payment.");
  }
}

type WalletEntry = {
  userId: string;
  amount: Prisma.Decimal.Value;
  type: "CREDIT" | "DEBIT" | "REFUND" | "ADJUSTMENT";
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdById?: string;
};

function positiveAmount(value: Prisma.Decimal.Value) {
  const amount = toMoney(value);
  if (!amount.isFinite() || amount.lte(0) || amount.decimalPlaces() > 2) {
    throw new Error("Wallet amounts must be positive with at most 2 decimal places.");
  }
  return amount;
}

async function ensureWallet(client: WalletClient, userId: string) {
  return client.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId, balance: 0, currency: "USD" },
  });
}

export async function getWallet(userId: string) {
  return ensureWallet(prisma, userId);
}

export async function creditWallet(client: WalletClient, entry: WalletEntry) {
  const amount = positiveAmount(entry.amount);
  const wallet = await ensureWallet(client, entry.userId);
  const updatedWallet = await client.wallet.update({
    where: { id: wallet.id },
    data: { balance: { increment: amount } },
  });

  await client.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: entry.type,
      amount,
      balanceAfter: updatedWallet.balance,
      description: entry.description,
      referenceType: entry.referenceType,
      referenceId: entry.referenceId,
      createdById: entry.createdById,
    },
  });

  return updatedWallet;
}

export async function debitWallet(client: WalletClient, entry: Omit<WalletEntry, "type">) {
  const amount = positiveAmount(entry.amount);
  const wallet = await ensureWallet(client, entry.userId);
  const debit = await client.wallet.updateMany({
    where: { id: wallet.id, balance: { gte: amount } },
    data: { balance: { decrement: amount } },
  });

  if (debit.count !== 1) {
    throw new InsufficientBalanceError();
  }

  const updatedWallet = await client.wallet.findUniqueOrThrow({
    where: { id: wallet.id },
  });

  await client.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: "DEBIT",
      amount,
      balanceAfter: updatedWallet.balance,
      description: entry.description,
      referenceType: entry.referenceType,
      referenceId: entry.referenceId,
      createdById: entry.createdById,
    },
  });

  return updatedWallet;
}
