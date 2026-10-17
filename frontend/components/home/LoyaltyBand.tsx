import Link from "next/link";
import TierStack from "@/components/loyalty/TierStack";
import { tierStyles } from "@/components/loyalty/tier-style";
import { getT } from "@/lib/i18n/server";
import { LOYALTY_TIERS, MAX_CASHBACK_RATE } from "@/lib/loyalty";

/** Home page pitch for the cashback program: the reason to come back after the first order. */
export default async function LoyaltyBand() {
  const { t } = await getT();
  const tiers = LOYALTY_TIERS.map((tier) => ({ id: tier.id, label: t(`loyalty.tier.${tier.id}`), rate: tier.rate }));

  return (
    <section className="relative overflow-hidden border-t border-slate-800 bg-gradient-to-b from-[#0b1220] to-[#070d18]">
      <div className="pointer-events-none absolute -end-20 top-0 h-[320px] w-[320px] rounded-full bg-amber-500/10 blur-[110px]" aria-hidden />
      <div className="reveal relative mx-auto grid max-w-7xl items-center gap-4 px-4 py-8 sm:px-6 md:py-14 lg:grid-cols-2 lg:gap-10">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 sm:text-xs">{t("loyalty.kicker")}</span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:mt-2 md:text-3xl">{t("loyalty.bandTitle")}</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400 md:mt-4 md:text-base">
            {t("loyalty.bandText", { max: MAX_CASHBACK_RATE })}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tiers.map((tier) => (
              <span key={tier.id} className={`rounded-full border px-3 py-1 text-xs font-semibold ${tierStyles[tier.id].chip}`}>
                {tier.label} · <span dir="ltr">{tier.rate}%</span>
              </span>
            ))}
          </div>
          <Link
            href="/rewards"
            className="mt-5 inline-flex rounded-lg bg-gradient-to-b from-amber-400 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_#7c2d12,0_12px_24px_-6px_rgba(234,88,12,0.6)] transition active:translate-y-[3px] active:shadow-[0_1px_0_#7c2d12]"
          >
            {t("loyalty.details")}
          </Link>
        </div>
        <TierStack tiers={tiers} />
      </div>
    </section>
  );
}
