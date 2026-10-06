import Link from "next/link";
import { Clock3, Coins, KeyRound, SearchCheck } from "lucide-react";

const iconByCategory = {
  IMEI: SearchCheck,
  SERVER_CREDIT: Coins,
  TOOL_RENTAL: KeyRound,
};

type ServiceRowProps = {
  slug: string;
  name: string;
  category: string;
  provider: string | null;
  estimatedTime: string;
  price: string;
  orderLabel: string;
};

/** Dense service line (name · time · price · order), the standard layout of GSM service lists. */
export default function ServiceRow({ slug, name, category, provider, estimatedTime, price, orderLabel }: ServiceRowProps) {
  const Icon = iconByCategory[category as keyof typeof iconByCategory] ?? SearchCheck;

  return (
    <Link href={`/services/${slug}`} className="group flex items-center gap-3 px-3 py-3 transition hover:bg-slate-800/40 sm:px-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-600/15 text-blue-400">
        <Icon size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p dir="auto" className="text-flow line-clamp-2 text-sm font-semibold leading-5 text-white transition group-hover:text-blue-300">{name}</p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-slate-400 sm:text-xs">
          <Clock3 size={12} className="shrink-0" />
          <span dir="auto" className="text-flow shrink-0">{estimatedTime}</span>
          {provider && (
            <>
              <span aria-hidden>·</span>
              <span dir="auto" className="text-flow truncate">{provider}</span>
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span dir="ltr" className="text-sm font-extrabold text-emerald-400 sm:text-base">${price}</span>
        <span className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white transition group-hover:bg-blue-500 sm:px-3 sm:py-1.5 sm:text-xs">
          {orderLabel}
        </span>
      </div>
    </Link>
  );
}
