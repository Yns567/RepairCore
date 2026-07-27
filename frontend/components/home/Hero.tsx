import Link from "next/link";
import { Wrench, ShieldCheck, Truck, Headset } from "lucide-react";

export default function Hero() {
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
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-blue-600/20 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-2">
        {/* Copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#0F1626] px-3 py-1 text-xs font-medium text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Built for repair technicians
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
            Everything your
            <br />
            repair bench runs on.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-400 md:text-lg">
            Genuine hardware, licensed unlock &amp; flash software, and
            hands-on courses — sourced, verified, and shipped for shops that
            can&apos;t afford downtime.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/hardware"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-colors hover:bg-blue-500"
            >
              Shop Hardware
            </Link>
            <Link
              href="/software"
              className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
            >
              Explore Software
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-800 pt-6 text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="shrink-0 text-blue-400" />
              <span className="text-xs leading-tight">
                Verified sellers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} className="shrink-0 text-blue-400" />
              <span className="text-xs leading-tight">
                Fast dispatch
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Headset size={18} className="shrink-0 text-blue-400" />
              <span className="text-xs leading-tight">
                Technician support
              </span>
            </div>
          </div>
        </div>

        {/* Signature visual: diagnostic terminal */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-blue-600/10 blur-2xl" />

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1220] shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-slate-800 bg-[#0F1626] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                <Wrench size={12} /> diagnostics.repaircore
              </span>
            </div>

            <div className="space-y-2.5 p-5 font-mono text-[13px]">
              <p className="text-slate-500">
                &gt; running full board scan...
              </p>
              <p className="text-emerald-400">
                CPU / SoC ................ OK
              </p>
              <p className="text-emerald-400">
                Battery health ........... 91%
              </p>
              <p className="text-amber-400">
                Charging IC .......... check
              </p>
              <p className="text-emerald-400">
                Display driver ........... OK
              </p>
              <p className="text-slate-500">
                &gt; unlock module: <span className="text-blue-400">Z3X</span>{" "}
                connected
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
