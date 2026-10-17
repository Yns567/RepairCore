"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { CheckCircle2, Lock, Smartphone, Sparkles, Zap } from "lucide-react";

export type HeroSceneLabels = Record<
  "balance" | "orders" | "delivered" | "fast" | "secure" | "code" | "done" | "processing",
  string
>;

// Stacked copies of the body behind the screen read as the phone's thickness once it turns.
const DEPTH_LAYERS = 9;

const orders = [
  { icon: Smartphone, name: "IMEI Info Check", done: true },
  { icon: Sparkles, name: "Gemini Pro · 12M", done: true },
  { icon: Zap, name: "Server credits ×50", done: false },
];

/** CSS-only 3D phone showing a delivered order; leans toward the mouse, sways on its own on touch screens. */
export default function HeroScene({ labels, rtl }: { labels: HeroSceneLabels; rtl: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const dir = rtl ? "rtl" : "ltr";

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !stage.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    stage.current.style.setProperty("--ry", `${x * 26}deg`);
    stage.current.style.setProperty("--rx", `${-y * 18}deg`);
  }

  function handleLeave() {
    stage.current?.style.setProperty("--rx", "0deg");
    stage.current?.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      dir="ltr"
      aria-hidden
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="scene-3d relative mx-auto h-[430px] w-full max-w-[440px] select-none sm:h-[490px]"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/30 blur-[90px]" />

      <div ref={stage} className="tilt-3d absolute inset-0 grid place-items-center">
        <div className="sway-3d relative">
          {/* Hologram rings on the "floor" under the phone. */}
          <div
            className="halo-3d absolute rounded-full border-2 border-dashed border-blue-400/40 shadow-[0_0_60px_rgba(59,130,246,0.45),inset_0_0_40px_rgba(59,130,246,0.35)]"
            style={{ left: "50%", top: "100%", width: 300, height: 300, marginLeft: -150, marginTop: -150 }}
          />
          <div
            className="halo-3d absolute rounded-full border border-cyan-300/30"
            style={{ left: "50%", top: "100%", width: 200, height: 200, marginLeft: -100, marginTop: -100, animationDirection: "reverse" }}
          />

          <div className="preserve-3d relative h-[340px] w-[168px] sm:h-[404px] sm:w-[200px]">
            {Array.from({ length: DEPTH_LAYERS }, (_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-[2.1rem] border border-slate-500/50 bg-[#141f36]"
                style={{ transform: `translateZ(${-(i + 1) * 1.6}px)` }}
              />
            ))}

            <div
              className="absolute inset-0 overflow-hidden rounded-[2.1rem] border-[5px] border-[#1c2740] bg-[#060b16] shadow-[0_40px_70px_-20px_rgba(0,0,0,0.8)]"
              style={{ transform: "translateZ(1px)" }}
            >
              <div className="absolute left-1/2 top-2 h-4 w-14 -translate-x-1/2 rounded-full bg-black" />

              <div dir={dir} className="flex h-full flex-col gap-2 px-3 pb-3 pt-8 text-[10px] sm:gap-2.5 sm:text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="icon-3d grid h-5 w-5 place-items-center rounded-md text-[9px] font-black text-white">R</span>
                  <span className="font-bold text-white">RepairCore</span>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-2.5 shadow-lg shadow-blue-900/50">
                  <p className="text-blue-100/80">{labels.balance}</p>
                  <p dir="ltr" className="text-flow mt-0.5 text-base font-extrabold text-white sm:text-lg">
                    1,250.00 <span className="text-[10px] font-semibold">MAD</span>
                  </p>
                  <p dir="ltr" className="text-flow text-blue-100/70">≈ 125.00 USD</p>
                </div>

                <p className="mt-0.5 font-semibold text-slate-400">{labels.orders}</p>
                {orders.map(({ icon: Icon, name, done }) => (
                  <div key={name} className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0b1220] p-1.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-blue-500/15 text-blue-300">
                      <Icon size={12} />
                    </span>
                    <span dir="ltr" className="text-flow min-w-0 flex-1 truncate font-medium text-slate-200">{name}</span>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                        done ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {done ? labels.done : labels.processing}
                    </span>
                  </div>
                ))}

                <div className="mt-auto rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
                  <p className="text-emerald-300/80">{labels.code}</p>
                  <p dir="ltr" className="mt-0.5 text-center font-mono text-[11px] font-bold tracking-wider text-emerald-300 sm:text-xs">
                    7F3K-92QX-L0PZ
                  </p>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
            </div>
          </div>

          <Chip dir={dir} z={95} delay="0s" className="-right-16 top-10 sm:-right-24" icon={<CheckCircle2 size={14} className="text-emerald-400" />}>
            {labels.delivered}
          </Chip>
          <Chip dir={dir} z={70} delay="-1.7s" className="-left-20 top-[44%] sm:-left-28" icon={<Zap size={14} className="text-amber-300" />}>
            {labels.fast}
          </Chip>
          <Chip dir={dir} z={115} delay="-3.2s" className="-right-12 bottom-16 sm:-right-20" icon={<Lock size={14} className="text-sky-300" />}>
            {labels.secure}
          </Chip>
          <Chip dir="ltr" z={50} delay="-2.4s" className="-left-10 top-0 sm:-left-16">
            <span className="font-bold text-amber-300">MAD</span>
            <span className="text-slate-500">·</span>
            <span className="font-bold text-emerald-300">USD</span>
          </Chip>
        </div>
      </div>
    </div>
  );
}

function Chip({
  children,
  icon,
  className,
  z,
  delay,
  dir,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className: string;
  z: number;
  delay: string;
  dir: "rtl" | "ltr";
}) {
  return (
    <div
      dir={dir}
      className={`float-3d absolute flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/10 bg-[#0f1a30]/90 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-xl shadow-black/50 sm:text-xs ${className}`}
      style={{ "--z": `${z}px`, animationDelay: delay } as CSSProperties}
    >
      {icon}
      {children}
    </div>
  );
}
