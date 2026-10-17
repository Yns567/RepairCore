import Link from "next/link";
import { ShieldCheck, Zap, MessageCircle } from "lucide-react";
import HeroScene from "@/components/home/HeroScene";
import { getT } from "@/lib/i18n/server";

export default async function Hero() {
  const { t, locale } = await getT();
  return (
    <section className="relative overflow-hidden bg-[#070D18]">
      {/* subtle grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="grid-floor opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 end-[-10%] h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[120px] md:h-[520px] md:w-[520px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 start-[-10%] h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 pb-6 pt-8 sm:px-6 md:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#0F1626] px-3 py-1 text-[11px] font-medium text-slate-400 sm:text-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {t("hero.badge")}
          </span>

          <h1 className="mt-4 text-[28px] font-extrabold leading-[1.25] tracking-tight text-white sm:text-4xl md:mt-6 md:text-5xl lg:text-6xl">
            {t("hero.title1")}
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
              {t("hero.title2")}
            </span>
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400 md:mt-6 md:text-lg">
            {t("hero.text")}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap md:mt-8 md:gap-4">
            <Link
              href="/store"
              className="rounded-lg bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_4px_0_#172554,0_12px_24px_-6px_rgba(37,99,235,0.6)] transition active:translate-y-[3px] active:shadow-[0_1px_0_#172554] hover:from-blue-400 hover:to-blue-600 md:px-6"
            >
              {t("hero.shopHardware")}
            </Link>
            <Link
              href="/services"
              className="rounded-lg border border-slate-700 bg-white/[0.03] px-5 py-3 text-center text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white md:px-6"
            >
              {t("nav.gsmServices")}
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 text-slate-400 md:mt-10 md:gap-6 md:pt-6">
            <TrustItem icon={<ShieldCheck size={18} />} label={t("hero.verified")} />
            <TrustItem icon={<Zap size={18} />} label={t("hero.dispatch")} />
            <TrustItem icon={<MessageCircle size={18} />} label={t("hero.support")} />
          </div>
        </div>

        <HeroScene
          rtl={locale === "ar"}
          labels={{
            balance: t("hero3d.balance"),
            orders: t("hero3d.orders"),
            delivered: t("hero3d.delivered"),
            fast: t("hero3d.fast"),
            secure: t("hero3d.secure"),
            code: t("hero3d.code"),
            done: t("hero3d.done"),
            processing: t("hero3d.processing"),
          }}
        />
      </div>
    </section>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:gap-2 sm:text-start">
      <span className="shrink-0 text-blue-400">{icon}</span>
      <span className="text-[11px] leading-tight sm:text-xs">{label}</span>
    </div>
  );
}
