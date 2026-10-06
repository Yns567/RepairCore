import Link from "next/link";
import { X } from "lucide-react";
import type { Prisma } from "@/lib/generated/prisma";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import CategoryChips from "@/components/store/CategoryChips";
import ProductCard from "@/components/store/ProductCard";
import SortSelect from "@/components/store/SortSelect";
import { catalogCategories, isCatalogCategory, translateCategory } from "@/lib/catalog";

const sortOrders: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  new: { createdAt: "desc" },
  old: { createdAt: "asc" },
  "price-low": { price: "asc" },
  "price-high": { price: "desc" },
  name: { name: "asc" },
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; brand?: string; sort?: string }>;
}) {
  const { search, category, brand, sort } = await searchParams;
  const { t } = await getT();
  const selectedCategory = isCatalogCategory(category) ? category : undefined;
  const selectedBrand = brand?.trim() || undefined;
  const query = search?.trim() || undefined;

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(query ? { name: { contains: query, mode: "insensitive" as const } } : {}),
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(selectedBrand ? { brand: selectedBrand } : {}),
    },
    orderBy: sortOrders[sort ?? ""] ?? sortOrders.new,
  });

  // Links keep the current sort (and search, unless cleared) so filtering never loses context.
  const storeHref = (slug: string | undefined, keepSearch = true) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (sort) params.set("sort", sort);
    if (query && keepSearch) params.set("search", query);
    const value = params.toString();
    return value ? `/store?${value}` : "/store";
  };
  const chipHref = (slug?: string) => storeHref(slug);

  const title = selectedBrand
    ? t("store.brandTitle", { brand: selectedBrand })
    : selectedCategory
      ? translateCategory(selectedCategory, t)
      : sort === "new"
        ? t("store.newArrivals")
        : t("store.title");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-10">
      <h1 className="text-2xl font-extrabold text-white md:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-slate-400">
        {selectedBrand
          ? t("store.brandSubtitle", { brand: selectedBrand })
          : selectedCategory
            ? t("store.categorySubtitle", { category: translateCategory(selectedCategory, t) })
            : t("store.subtitle")}
      </p>

      <CategoryChips
        className="mt-5"
        chips={[
          { href: chipHref(), label: t("store.all"), active: !selectedCategory },
          ...catalogCategories.map((item) => ({
            href: chipHref(item.slug),
            label: t(item.key),
            active: selectedCategory === item.slug,
          })),
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex min-w-0 items-center gap-2 text-sm text-slate-400">
          <span>{t("store.count", { count: products.length })}</span>
          {query && (
            <Link
              href={storeHref(selectedCategory, false)}
              className="flex min-w-0 items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-white hover:bg-slate-700"
            >
              <span dir="auto" className="text-flow truncate">“{query}”</span>
              <X size={13} className="shrink-0" />
            </Link>
          )}
        </div>
        <SortSelect />
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">{t("store.empty")}</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              price={`${product.price.toFixed(2)} MAD`}
              inStock={product.stock > 0}
              image={product.image}
              slug={product.slug}
            />
          ))}
        </div>
      )}
    </main>
  );
}
