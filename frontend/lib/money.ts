import { Prisma } from "@/lib/generated/prisma";

export const Decimal = Prisma.Decimal;
export type Money = Prisma.Decimal;

/** Parses a monetary value exactly (no float math). Accepts Decimal, string or number input. */
export function toMoney(value: Prisma.Decimal.Value): Money {
  return new Decimal(value);
}

/** Sums `unitPrice * quantity` lines using Decimal arithmetic. */
export function sumLines(lines: { unitPrice: Prisma.Decimal.Value; quantity: number }[]): Money {
  return lines.reduce<Money>(
    (total, line) => total.plus(toMoney(line.unitPrice).times(line.quantity)),
    new Decimal(0),
  );
}

/** Formats a monetary value for display with two decimals. */
export function formatMoney(value: Prisma.Decimal.Value): string {
  return toMoney(value).toFixed(2);
}

/** Zod-friendly check: a positive amount with at most 2 decimal places. */
export const MONEY_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;
