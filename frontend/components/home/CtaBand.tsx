import Link from "next/link";
import { Cpu, Headset, ShieldCheck, Smartphone, Wallet, Zap } from "lucide-react";
import { getT } from "@/lib/i18n/server";

const cubeFaces = [Smartphone, Zap, ShieldCheck, Cpu, Wallet, Headset];

export default async function CtaBand() {
  const { t } = await getT();

  return (
    <section className="relative overflow-hidden bg-[#070D18]">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[100px]"
        aria-hidden
      />
      <div className="grid-floor opacity-40" aria-hidden />
      <div className="reveal relative mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 md:py-20">
        <div className="scene-3d mx-auto mb-8 grid h-24 w-24 place-items-center" aria-hidden>
          <div className="cube-3d">
            {cubeFaces.map((Icon, index) => (
              <span key={index}>
                <Icon size={28} strokeWidth={1.8} />
              </span>
            ))}
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">{t("cta.title")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">{t("cta.text")}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-8 md:gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-b from-blue-500 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_0_#172554,0_12px_24px_-6px_rgba(37,99,235,0.6)] transition active:translate-y-[3px] active:shadow-[0_1px_0_#172554] hover:from-blue-400 hover:to-blue-600"
          >
            {t("cta.register")}
          </Link>
          <Link
            href="/store"
            className="rounded-lg border border-slate-700 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
          >
            {t("cta.browse")}
          </Link>
        </div>
      </div>
    </section>
  );
}
