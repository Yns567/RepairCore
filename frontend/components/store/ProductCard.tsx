import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { translateCategory } from "@/lib/catalog";
import { getT } from "@/lib/i18n/server";

type ProductCardProps = {
  id: number;
  name: string;
  category: string | null;
  price: string;
  inStock: boolean;
  image: string | null;
  slug: string;
};

/** Compact card designed for a 2-column grid on phones, as on most GSM shops. */
export default async function ProductCard({
  id,
  name,
  category,
  price,
  inStock,
  image,
  slug,
}: ProductCardProps) {
  const { t } = await getT();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220] transition hover:-translate-y-0.5 hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-950/40">
      <Link href={`/products/${slug}`} className="relative block aspect-square bg-white">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-3 transition duration-300 group-hover:scale-105"
        />
        <span className="absolute start-2 top-2 max-w-[75%] truncate rounded-md bg-blue-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {translateCategory(category, t)}
        </span>
        {!inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 py-1 text-center text-[11px] font-semibold text-rose-300">
            {t("stock.out")}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <Link href={`/products/${slug}`} className="block">
          <h3 dir="auto" className="text-flow line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-5 text-white transition group-hover:text-blue-300 sm:text-sm">
            {name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span dir="ltr" className="text-base font-extrabold text-blue-400 sm:text-lg">{price}</span>
          {inStock && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              {t("stock.in")}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2.5">
          <AddToCartButton productId={id} disabled={!inStock} fullWidth compact />
        </div>
      </div>
    </article>
  );
}
