import Tilt from "@/components/ui/Tilt";
import { tierStyles, type TierId } from "./tier-style";

/** Membership card in the colors of the customer's level; leans with the mouse. */
export default function LoyaltyCard({
  tierId,
  levelLabel,
  tierLabel,
  rateLabel,
  progress,
  progressLabel,
  pointsLabel,
  name,
}: {
  tierId: TierId;
  levelLabel: string;
  tierLabel: string;
  rateLabel: string;
  progress: number;
  progressLabel: string;
  pointsLabel: string;
  name?: string | null;
}) {
  const style = tierStyles[tierId];
  const Icon = style.icon;
  const width = Math.max(4, Math.min(100, Math.round(progress * 100)));

  return (
    <Tilt className="rounded-2xl" max={9}>
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.card} p-5 text-white shadow-2xl shadow-black/50 ring-1 ring-white/15 sm:p-6`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.22)_45%,transparent_60%)]" />
        <div className="pointer-events-none absolute -end-12 -top-12 h-44 w-44 rounded-full border-[20px] border-white/10" />
        <div className="pointer-events-none absolute inset-0 bg-black/10" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">RepairCore</p>
            <p className="mt-3 text-xs text-white/75">{levelLabel}</p>
            <p className="text-2xl font-extrabold drop-shadow-md sm:text-3xl">{tierLabel}</p>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 shadow-inner ring-1 ring-white/25">
            <Icon size={26} />
          </span>
        </div>

        <p className="relative mt-3 inline-flex rounded-full bg-black/25 px-3 py-1 text-sm font-bold">{rateLabel}</p>

        <div className="relative mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-black/30">
            <div className="h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]" style={{ width: `${width}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-white/85">
            <span>{progressLabel}</span>
            <span>{pointsLabel}</span>
          </div>
        </div>

        {name && (
          <p dir="auto" className="relative mt-4 truncate font-mono text-sm uppercase tracking-widest text-white/85">
            {name}
          </p>
        )}
      </div>
    </Tilt>
  );
}
