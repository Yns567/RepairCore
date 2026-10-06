import "server-only";

export const TOP_UP_BANKS = {
  CIH: "CIH Bank",
  ATTIJARIWAFA: "Attijariwafa Bank",
  BMCE: "Bank of Africa (BMCE)",
  BP: "Banque Populaire",
  OTHER: "Other bank",
} as const;
export type TopUpBank = keyof typeof TOP_UP_BANKS;

export const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;
export const MAX_PENDING_TOP_UPS = 3;

export type BankAccount = { bank: string; holder: string; rib: string };

/**
 * Accounts customers transfer to. Configure with BANK_ACCOUNTS_JSON, e.g.
 * [{"bank":"CIH Bank","holder":"RepairCore","rib":"230 ..."}]. Kept out of the
 * repository so account numbers can change without a code release.
 */
export function getBankAccounts(): BankAccount[] {
  try {
    const parsed: unknown = JSON.parse(process.env.BANK_ACCOUNTS_JSON ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is BankAccount =>
        typeof item?.bank === "string" && typeof item?.holder === "string" && typeof item?.rib === "string",
    );
  } catch {
    return [];
  }
}

/** Detects the receipt type from its first bytes instead of trusting the browser. */
export function detectReceiptType(bytes: Uint8Array): string | null {
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  if (startsWith(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (startsWith(0x89, 0x50, 0x4e, 0x47)) return "image/png";
  if (startsWith(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return "image/webp";
  }
  if (startsWith(0x25, 0x50, 0x44, 0x46)) return "application/pdf";
  return null;
}
