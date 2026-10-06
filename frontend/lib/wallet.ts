import "server-only";

import type { Prisma } from "@/lib/generated/prisma";
import { CURRENCIES, type Currency, toMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type WalletClient = Pick<typeof prisma, "wallet" | "walletTransaction">;

export class InsufficientBalanceError extends Error {
  constructor() {
    super("Your store balance is not enough to complete this payment.");
  }
}

type WalletEntry = {
  userId: string;
  currency: Currency;
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

async function ensureWallet(client: WalletClient, userId: string, currency: Currency) {
  return client.wallet.upsert({
    where: { userId_currency: { userId, currency } },
    update: {},
    create: { userId, balance: 0, currency },
  });
}

export async function getWallet(userId: string, currency: Currency) {
  return ensureWallet(prisma, userId, currency);
}

/** All wallets of a user, one per supported currency, in a stable order. */
export async function getWallets(userId: string) {
  return Promise.all(CURRENCIES.map((currency) => ensureWallet(prisma, userId, currency)));
}

export async function creditWallet(client: WalletClient, entry: WalletEntry) {
  const amount = positiveAmount(entry.amount);
  const wallet = await ensureWallet(client, entry.userId, entry.currency);
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
  const wallet = await ensureWallet(client, entry.userId, entry.currency);
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
