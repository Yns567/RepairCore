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

export const CURRENCIES = ["MAD", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Which currency each part of the catalog is priced in. Balances never convert. */
export const PRICING_CURRENCY = {
  store: "MAD",
  course: "MAD",
  gsmService: "USD",
  subscription: "USD",
} as const satisfies Record<string, Currency>;

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}

/** Formats a monetary value for display, e.g. "1250.00 MAD" or "$24.99". */
export function formatMoney(value: Prisma.Decimal.Value, currency?: string): string {
  const amount = toMoney(value).toFixed(2);
  if (currency === "USD") return `$${amount}`;
  return currency ? `${amount} ${currency}` : amount;
}

/** Zod-friendly check: a positive amount with at most 2 decimal places. */
export const MONEY_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;
