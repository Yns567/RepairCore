import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export default async function TrendingProducts() {
  const [products, { t }] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    getT(),
  ]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-12">
      <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-500 sm:text-xs">{t("trending.kicker")}</span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:mt-2 md:text-3xl">{t("trending.title")}</h2>
        </div>
        <Link href="/store" className="shrink-0 text-sm font-medium text-blue-400 hover:text-blue-300">{t("trending.viewAll")}</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {products.map((product, index) => (
          // 10 fill two rows of 5 on desktop; phones show 6 to keep the page short.
          <div key={product.id} className={index >= 6 ? "hidden lg:block" : undefined}>
            <ProductCard
              id={product.id}
              name={product.name}
              category={product.category}
              price={`${product.price.toFixed(2)} MAD`}
              inStock={product.stock > 0}
              image={product.image}
              slug={product.slug}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
