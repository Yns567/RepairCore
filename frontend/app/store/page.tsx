import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/store/SearchBar";
import ProductCard from "@/components/store/ProductCard";
import {
  getCatalogCategoryLabel,
  isCatalogCategory,
} from "@/lib/catalog";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; brand?: string; sort?: string }>;
}) {
  const { search, category, brand, sort } = await searchParams;
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
    orderBy: {
      createdAt: sort === "new" ? "desc" : "desc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="text-4xl font-bold text-white">
        {selectedBrand
          ? `${selectedBrand} products`
          : selectedCategory
            ? getCatalogCategoryLabel(selectedCategory)
            : sort === "new"
              ? "New Arrivals"
              : "Store"}
      </h1>

      <p className="mt-4 text-slate-400">
        {selectedBrand
          ? `Available repair products from ${selectedBrand}.`
          : selectedCategory
          ? `Browse our ${getCatalogCategoryLabel(selectedCategory).toLowerCase()} collection.`
          : "Repair tools, boxes, programmers, spare parts and accessories."}
      </p>

      <div className="mt-8">
        <SearchBar />
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">No matching products right now.</p>
      ) : (
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            category={product.category ?? "Unknown"}
            price={product.price.toString()}
            stock={product.stock > 0 ? "In Stock" : "Out of Stock"}
            image={product.image}
            slug={product.slug}
          />
        ))}
      </div>
      )}
    </main>
  );
}
