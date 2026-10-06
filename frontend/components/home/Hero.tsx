import Link from "next/link";
import { Wrench, ShieldCheck, Truck, Headset } from "lucide-react";
import { getT } from "@/lib/i18n/server";

export default async function Hero() {
  const { t } = await getT();
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
      <div
        className="pointer-events-none absolute -top-40 end-[-10%] h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[120px] md:h-[520px] md:w-[520px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-8 sm:px-6 md:py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#0F1626] px-3 py-1 text-[11px] font-medium text-slate-400 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t("hero.badge")}
          </span>

          <h1 className="mt-4 text-[28px] font-extrabold leading-[1.2] tracking-tight text-white sm:text-4xl md:mt-6 md:text-5xl lg:text-6xl">
            {t("hero.title1")}
            <br />
            {t("hero.title2")}
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400 md:mt-6 md:text-lg">
            {t("hero.text")}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap md:mt-8 md:gap-4">
            <Link
              href="/store"
              className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-colors hover:bg-blue-500 md:px-6"
            >
              {t("hero.shopHardware")}
            </Link>
            <Link
              href="/services"
              className="rounded-lg border border-slate-700 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white md:px-6"
            >
              {t("nav.gsmServices")}
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 text-slate-400 md:mt-10 md:gap-6 md:pt-6">
            <TrustItem icon={<ShieldCheck size={18} />} label={t("hero.verified")} />
            <TrustItem icon={<Truck size={18} />} label={t("hero.dispatch")} />
            <TrustItem icon={<Headset size={18} />} label={t("hero.support")} />
          </div>
        </div>

        {/* Signature visual: diagnostic terminal. Desktop only, it costs too much height on phones. */}
        <div className="relative mx-auto hidden w-full max-w-md lg:block">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-blue-600/10 blur-2xl" />

          <div dir="ltr" className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1220] shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-slate-800 bg-[#0F1626] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                <Wrench size={12} /> diagnostics.repaircore
              </span>
            </div>

            <div className="space-y-2.5 p-5 font-mono text-[13px]">
              <p className="text-slate-500">&gt; running full board scan...</p>
              <p className="text-emerald-400">CPU / SoC ................ OK</p>
              <p className="text-emerald-400">Battery health ........... 91%</p>
              <p className="text-amber-400">Charging IC .......... check</p>
              <p className="text-emerald-400">Display driver ........... OK</p>
              <p className="text-slate-500">
                &gt; unlock module: <span className="text-blue-400">Z3X</span> connected
              </p>
              <p className="flex items-center gap-1 text-slate-300">
                &gt; ready for repair
                <span className="ml-1 inline-block h-3.5 w-2 animate-pulse bg-blue-400" />
              </p>
            </div>
          </div>
        </div>
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
