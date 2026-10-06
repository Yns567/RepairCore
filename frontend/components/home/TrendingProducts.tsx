import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getT } from "@/lib/i18n/server";

export default async function TrendingProducts() {
  const { t } = await getT();
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-500">
            {t("trending.kicker")}
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t("trending.title")}
          </h2>
        </div>
        <Link
          href="/store"
          className="hidden text-sm font-medium text-blue-400 hover:text-blue-300 md:block"
        >
          {t("trending.viewAll")}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1220] transition-colors hover:border-slate-700"
          >
            <Link href={`/products/${product.slug}`}>
              <div className="relative h-40 bg-[#0F1626]">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>

            <div className="p-4">
              <p className="truncate text-sm font-medium text-white">
                {product.name}
              </p>
              <p className="mt-1 text-base font-bold text-blue-400">
                {product.price.toFixed(2)} MAD
              </p>

              <div className="mt-3">
                <AddToCartButton
                  productId={product.id}
                  disabled={product.stock <= 0}
                  fullWidth
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/store"
        className="mt-8 block text-center text-sm font-medium text-blue-400 hover:text-blue-300 md:hidden"
      >
        {t("trending.viewAllProducts")}
      </Link>
    </section>
  );
}
