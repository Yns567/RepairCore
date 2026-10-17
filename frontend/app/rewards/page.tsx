import type { Metadata } from "next";
import Link from "next/link";
import { BadgePercent, Repeat, ShoppingBag } from "lucide-react";
import { auth } from "@/auth";
import LoyaltyCard from "@/components/loyalty/LoyaltyCard";
import TierStack from "@/components/loyalty/TierStack";
import { tierStyles } from "@/components/loyalty/tier-style";
import Tilt from "@/components/ui/Tilt";
import { getT } from "@/lib/i18n/server";
import { getLoyalty, LOYALTY_TIERS, MAX_CASHBACK_RATE } from "@/lib/loyalty";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Rewards",
  description: "Earn cashback in your RepairCore balance on every completed order.",
};

export default async function RewardsPage() {
  const [session, { t, formatDay }] = await Promise.all([auth(), getT()]);
  const user = session?.user;
  const loyalty = user?.id ? await getLoyalty(user.id) : null;
  const tierLabel = (id: (typeof LOYALTY_TIERS)[number]["id"]) => t(`loyalty.tier.${id}`);
  const steps = [
    { icon: ShoppingBag, text: t("loyalty.step1") },
    { icon: BadgePercent, text: t("loyalty.step2") },
    { icon: Repeat, text: t("loyalty.step3") },
  ];

  return (
    <main className="relative overflow-hidden bg-[#070d18]">
      <div className="pointer-events-none absolute -top-40 start-[-10%] h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-[120px]" aria-hidden />

      <section className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 md:py-14 lg:grid-cols-2">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 sm:text-xs">{t("loyalty.kicker")}</span>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">{t("loyalty.title")}</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400 md:mt-5 md:text-lg">
            {t("loyalty.text", { max: MAX_CASHBACK_RATE })}
          </p>
          {!user && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex">
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-b from-amber-400 to-orange-600 px-5 py-3 text-center text-sm font-bold text-white shadow-[0_4px_0_#7c2d12,0_12px_24px_-6px_rgba(234,88,12,0.6)] transition active:translate-y-[3px] active:shadow-[0_1px_0_#7c2d12]"
              >
                {t("loyalty.join")}
              </Link>
              <Link
                href="/login?callbackUrl=/rewards"
                className="rounded-lg border border-slate-700 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
              >
                {t("loyalty.signIn")}
              </Link>
            </div>
          )}
        </div>

        {loyalty ? (
          <div className="mx-auto w-full max-w-md">
            <LoyaltyCard
              tierId={loyalty.tier.id}
              levelLabel={t("loyalty.yourLevel")}
              tierLabel={tierLabel(loyalty.tier.id)}
              rateLabel={t("loyalty.cashback", { rate: loyalty.tier.rate })}
              progress={loyalty.progress}
              progressLabel={
                loyalty.next
                  ? t("loyalty.toNext", { points: loyalty.pointsToNext.toLocaleString("en"), tier: tierLabel(loyalty.next.id) })
                  : t("loyalty.maxLevel")
              }
              pointsLabel={t("loyalty.points", { points: loyalty.points.toLocaleString("en") })}
              name={user?.name}
            />
          </div>
        ) : (
          <TierStack tiers={LOYALTY_TIERS.map((tier) => ({ id: tier.id, label: tierLabel(tier.id), rate: tier.rate }))} />
        )}
      </section>

      {loyalty && (
        <section className="relative mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-[18rem_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5">
            <p className="text-sm text-slate-400">{t("loyalty.earned")}</p>
            {loyalty.earned.length > 0 ? (
              <div className="mt-2 space-y-1">
                {loyalty.earned.map((row) => (
                  <p key={row.currency} dir="ltr" className="text-flow text-2xl font-extrabold text-emerald-300">
                    {formatMoney(row.amount, row.currency)}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t("loyalty.none")}</p>
            )}
          </div>

          {loyalty.recent.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5">
              <p className="text-sm font-semibold text-white">{t("loyalty.recent")}</p>
              <ul className="mt-3 divide-y divide-slate-800">
                {loyalty.recent.map((reward) => (
                  <li key={reward.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="text-slate-400">{formatDay(reward.createdAt)}</span>
                    <span className="flex items-center gap-2">
                      {reward.reversedAt && (
                        <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-300">{t("loyalty.reversed")}</span>
                      )}
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300" dir="ltr">
                        {reward.rate.toString()}%
                      </span>
                      <span dir="ltr" className={`font-bold ${reward.reversedAt ? "text-slate-500 line-through" : "text-emerald-300"}`}>
                        +{formatMoney(reward.amount, reward.currency)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="reveal relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <h2 className="text-xl font-bold text-white md:text-3xl">{t("loyalty.howTitle")}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3 md:gap-5">
          {steps.map(({ icon: Icon, text }, index) => (
            <div key={index} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-[#0b1220] p-4 md:p-5">
              <span className="icon-3d grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white">
                <Icon size={20} />
              </span>
              <div>
                <span className="text-xs font-bold text-blue-400" dir="ltr">0{index + 1}</span>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-300">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-bold text-white md:mt-14 md:text-3xl">{t("loyalty.levelsTitle")}</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {LOYALTY_TIERS.map((tier) => {
            const style = tierStyles[tier.id];
            const Icon = style.icon;
            const current = loyalty?.tier.id === tier.id;
            return (
              <Tilt key={tier.id} className="rounded-2xl">
                <div className={`h-full overflow-hidden rounded-2xl border bg-[#0b1220] ${current ? "border-amber-400/70 shadow-[0_0_30px_-6px_rgba(251,191,36,0.5)]" : "border-slate-800"}`}>
                  <div className={`flex items-center justify-between bg-gradient-to-br ${style.card} px-4 py-3 text-white`}>
                    <span className="font-extrabold">{tierLabel(tier.id)}</span>
                    <Icon size={20} />
                  </div>
                  <div className="p-4">
                    <p className="text-2xl font-black text-white" dir="ltr">{tier.rate}%</p>
                    <p className="text-xs text-slate-400">{t("loyalty.cashback", { rate: tier.rate })}</p>
                    <p className={`mt-3 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${style.chip}`}>
                      {t("loyalty.from", { points: tier.minPoints.toLocaleString("en") })}
                    </p>
                  </div>
                </div>
              </Tilt>
            );
          })}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-slate-500">{t("loyalty.pointsRule")}</p>
      </section>
    </main>
  );
}
