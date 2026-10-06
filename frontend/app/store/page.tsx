import type { Prisma } from "@/lib/generated/prisma";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/store/SearchBar";
import ProductCard from "@/components/store/ProductCard";
import {
  isCatalogCategory,
  translateCategory,
} from "@/lib/catalog";

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

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      name: {
        contains: search,
        mode: "insensitive",
      },
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(selectedBrand ? { brand: selectedBrand } : {}),
    },
    orderBy: sortOrders[sort ?? ""] ?? sortOrders.new,
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="text-4xl font-bold text-white">
        {selectedBrand
          ? t("store.brandTitle", { brand: selectedBrand })
          : selectedCategory
            ? translateCategory(selectedCategory, t)
            : sort === "new"
              ? t("store.newArrivals")
              : t("store.title")}
      </h1>

      <p className="mt-4 text-slate-400">
        {selectedBrand
          ? t("store.brandSubtitle", { brand: selectedBrand })
          : selectedCategory
          ? t("store.categorySubtitle", { category: translateCategory(selectedCategory, t) })
          : t("store.subtitle")}
      </p>

      <div className="mt-8">
        <SearchBar />
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">{t("store.empty")}</p>
      ) : (
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
