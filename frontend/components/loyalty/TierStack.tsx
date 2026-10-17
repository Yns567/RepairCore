import type { CSSProperties } from "react";
import { tierStyles, type TierId } from "./tier-style";

const CARD_W = 190;
const CARD_H = 118;

/** Isometric stack of the four level cards floating above each other (decorative). */
export default function TierStack({ tiers }: { tiers: { id: TierId; label: string; rate: number }[] }) {
  return (
    <div dir="ltr" aria-hidden className="scene-3d relative mx-auto h-[250px] w-full max-w-[360px] select-none sm:h-[300px]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/20 blur-[80px]" />
      <div
        className="preserve-3d absolute"
        style={{
          left: "50%",
          top: "58%",
          width: CARD_W,
          height: CARD_H,
          marginLeft: -CARD_W / 2,
          marginTop: -CARD_H / 2,
          transform: "rotateX(58deg) rotateZ(-38deg)",
        }}
      >
        <div className="absolute inset-[-18px] rounded-3xl border border-dashed border-blue-400/30 bg-blue-500/5" />
        {tiers.map((tier, index) => {
          const style = tierStyles[tier.id];
          const Icon = style.icon;
          return (
            <div
              key={tier.id}
              className={`lift-3d absolute inset-0 flex flex-col justify-between rounded-2xl bg-gradient-to-br ${style.card} p-3.5 text-white shadow-[0_18px_30px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/20`}
              style={{ "--z": `${index * 34}px`, animationDelay: `${index * -0.6}s` } as CSSProperties}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">RepairCore</span>
                <Icon size={18} />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-base font-extrabold">{tier.label}</span>
                <span className="rounded-full bg-black/25 px-2 py-0.5 text-sm font-black">{tier.rate}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
