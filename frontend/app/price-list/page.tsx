import type { Metadata } from "next";
import { Search } from "lucide-react";
import CategoryChips from "@/components/store/CategoryChips";
import ProductRow from "@/components/store/ProductRow";
import { catalogCategories, isCatalogCategory } from "@/lib/catalog";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Price list",
};

export default async function PriceListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const { t } = await getT();
  const selectedCategory = isCatalogCategory(category) ? category : undefined;
  const query = search?.trim() || undefined;

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(query ? { name: { contains: query, mode: "insensitive" as const } } : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true, category: true, price: true, deliveryTime: true, stock: true, image: true },
  });

  const listHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (query) params.set("search", query);
    const value = params.toString();
    return value ? `/price-list?${value}` : "/price-list";
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-10">
      <h1 className="text-2xl font-extrabold text-white md:text-3xl">{t("list.title")}</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-400">{t("list.subtitle")}</p>

      <form action="/price-list" className="mt-5 flex gap-2">
        {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
        <label className="relative flex-1">
          <span className="sr-only">{t("list.search")}</span>
          <Search size={17} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            name="search"
            defaultValue={query}
            placeholder={t("list.search")}
            className="w-full rounded-lg border border-slate-700 bg-[#0b1220] py-2.5 ps-10 pe-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />
        </label>
        <button className="rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500">
          {t("services.searchButton")}
        </button>
      </form>

      <CategoryChips
        className="mt-4"
        chips={[
          { href: listHref(), label: t("store.all"), active: !selectedCategory },
          ...catalogCategories.map((item) => ({
            href: listHref(item.slug),
            label: t(item.key),
            active: selectedCategory === item.slug,
          })),
        ]}
      />

      <p className="mt-4 text-sm text-slate-400">{t("store.count", { count: products.length })}</p>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">{t("list.empty")}</p>
      ) : (
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220]">
          {/* Column headers (desktop only). */}
          <div className="hidden grid-cols-[auto_1fr_8rem_7rem_auto] gap-4 border-b border-slate-800 bg-slate-800/30 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:grid">
            <span className="w-11" aria-hidden />
            <span>{t("list.product")}</span>
            <span>{t("list.price")}</span>
            <span>{t("list.delivery")}</span>
            <span className="justify-self-end">{t("list.action")}</span>
          </div>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              slug={product.slug}
              name={product.name}
              category={product.category}
              price={product.price.toFixed(2)}
              deliveryTime={product.deliveryTime}
              inStock={product.stock > 0}
              image={product.image}
            />
          ))}
        </div>
      )}
    </main>
  );
}
