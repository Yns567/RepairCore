import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/store/SearchBar";
import ProductCard from "@/components/store/ProductCard";
import { hardwareCategorySlugs } from "@/lib/catalog";

export default async function HardwarePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const { t } = await getT();

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      category: { in: hardwareCategorySlugs },
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="text-4xl font-bold text-white">{t("hardware.title")}</h1>

      <p className="mt-4 text-slate-400">
        {t("hardware.subtitle")}
      </p>

      <div className="mt-8">
        <SearchBar path="/hardware" />
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">
          {t("store.empty")}
        </p>
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
