import Link from "next/link";
import { ArrowRight, Clock3, Coins, KeyRound, SearchCheck } from "lucide-react";
import { getGsmServiceCategory } from "@/lib/gsm-services";

const iconByCategory = {
  IMEI: SearchCheck,
  SERVER_CREDIT: Coins,
  TOOL_RENTAL: KeyRound,
};

type ServiceCardProps = {
  name: string;
  slug: string;
  description: string | null;
  category: string;
  provider: string | null;
  estimatedTime: string;
  price: string;
};

export default function ServiceCard({ name, slug, description, category, provider, estimatedTime, price }: ServiceCardProps) {
  const Icon = iconByCategory[category as keyof typeof iconByCategory] ?? SearchCheck;
  const categoryLabel = getGsmServiceCategory(category)?.shortLabel ?? category;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-[#0b1220] p-6 transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-950/30">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600/15 text-blue-400"><Icon size={23} /></span>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold text-slate-300">{categoryLabel}</span>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-blue-400">{provider || "RepairCore"}</p>
      <h2 className="mt-2 text-lg font-bold leading-snug text-white">{name}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-5 flex items-center gap-2 text-xs text-slate-400"><Clock3 size={15} className="text-blue-400" /> {estimatedTime}</div>
      <div className="mt-5 flex items-end justify-between border-t border-slate-800 pt-5">
        <div><p className="text-[11px] uppercase tracking-wide text-slate-500">Price</p><p className="mt-1 text-2xl font-extrabold text-white">${price}</p></div>
        <Link href={`/services/${slug}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">Order <ArrowRight size={16} /></Link>
      </div>
    </article>
  );
}
