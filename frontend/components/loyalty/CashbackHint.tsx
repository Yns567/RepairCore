import Link from "next/link";
import { Gift } from "lucide-react";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n/server";
import { cashbackAmount, cashbackRateFor, MAX_CASHBACK_RATE } from "@/lib/loyalty";
import { formatMoney } from "@/lib/money";

/** "Earn X cashback" line next to a price, so the reward is visible before buying. */
export default async function CashbackHint({ price, currency }: { price: string; currency: "MAD" | "USD" }) {
  const [session, { t }] = await Promise.all([auth(), getT()]);
  const userId = session?.user?.id;

  let text = t("loyalty.earnHintGuest", { max: MAX_CASHBACK_RATE });
  if (userId) {
    const amount = cashbackAmount(price, await cashbackRateFor(userId));
    if (amount.lte(0)) return null;
    text = t("loyalty.earnHint", { amount: formatMoney(amount, currency) });
  }

  return (
    <Link
      href="/rewards"
      className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-orange-500/5 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:border-amber-400/60 sm:text-sm"
    >
      <Gift size={15} className="text-amber-300" />
      <span>{text}</span>
    </Link>
  );
}
