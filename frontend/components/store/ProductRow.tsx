import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Clock3 } from "lucide-react";
import { translateCategory } from "@/lib/catalog";
import { getT } from "@/lib/i18n/server";

type ProductRowProps = {
  slug: string;
  name: string;
  category: string | null;
  price: string;
  deliveryTime: string;
  inStock: boolean;
  image: string | null;
};

/** One dense price-list line: image, name, price, delivery time. The whole row links to the product. */
export default async function ProductRow({ slug, name, category, price, deliveryTime, inStock, image }: ProductRowProps) {
  const { t } = await getT();

  return (
    <Link
      href={`/products/${slug}`}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-slate-800 px-3 py-3 transition first:border-t-0 hover:bg-slate-800/40 sm:grid-cols-[auto_1fr_8rem_7rem_auto] sm:gap-4 sm:px-4"
    >
      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white">
        <Image src={image || "/placeholder.svg"} alt="" fill sizes="44px" className="object-contain p-1" />
      </span>

      <div className="min-w-0">
        <p dir="auto" className="text-flow line-clamp-1 text-sm font-semibold text-white transition group-hover:text-blue-300">{name}</p>
        <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">{translateCategory(category, t)}</p>
      </div>

      {/* Price + delivery: stacked on the right on phones, own columns on desktop. */}
      <div className="flex flex-col items-end gap-0.5 sm:order-none sm:items-start">
        <span dir="ltr" className="text-sm font-extrabold text-blue-400 sm:text-base">{price} MAD</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-400 sm:hidden">
          <Clock3 size={11} /> <span dir="auto">{deliveryTime}</span>
        </span>
      </div>

      <span className="hidden items-center gap-1.5 text-xs text-slate-300 sm:flex">
        <Clock3 size={13} className="text-slate-500" /> <span dir="auto">{deliveryTime}</span>
      </span>

      <span className="hidden items-center gap-2 justify-self-end sm:flex">
        <span className={`text-[11px] font-medium ${inStock ? "text-emerald-400" : "text-rose-400"}`}>
          {inStock ? t("stock.in") : t("stock.out")}
        </span>
        <span className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition group-hover:bg-blue-500">
          {t("list.action")}
        </span>
      </span>

      <ChevronLeft size={16} className="justify-self-end text-slate-500 rtl:rotate-180 sm:hidden" />
    </Link>
  );
}
