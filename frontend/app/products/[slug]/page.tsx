import Link from "next/link";
import { Banknote, Check, ChevronRight, Headset, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import ProductPurchase from "@/components/cart/ProductPurchase";
import ProductCard from "@/components/store/ProductCard";
import ProductGallery from "@/components/store/ProductGallery";
import { translateCategory } from "@/lib/catalog";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product) {
    notFound();
  }

  const [relatedProducts, { t }] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        category: product.category,
        id: { not: product.id },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    getT(),
  ]);

  const isAvailable = product.status === "ACTIVE" && product.stock > 0;
  const productImages = [product.image, product.image2, product.image3].filter(
    (image): image is string => Boolean(image),
  );
  const categoryLabel = product.category ? translateCategory(product.category, t) : null;
  const details = [
    product.brand && { label: t("product.brand"), value: product.brand },
    categoryLabel && { label: t("product.category"), value: categoryLabel },
    product.partNumber && { label: t("product.partNumber"), value: product.partNumber },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail));

  return (
    <main className="min-h-screen bg-[#070d18] text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8">
        <nav aria-label={t("product.breadcrumb")} className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
          <Link href="/" className="transition hover:text-blue-400">{t("product.home")}</Link>
          <ChevronRight size={14} className="rtl:rotate-180" />
          <Link href="/store" className="transition hover:text-blue-400">{t("store.title")}</Link>
          {categoryLabel && product.category && (
            <>
              <ChevronRight size={14} className="rtl:rotate-180" />
              <Link href={`/store?category=${encodeURIComponent(product.category)}`} className="transition hover:text-blue-400">{categoryLabel}</Link>
            </>
          )}
        </nav>

        <section className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <ProductGallery
            key={product.id}
            images={productImages}
            productName={product.name}
            category={categoryLabel}
          />

          <div className="flex flex-col">
            <h1 dir="auto" className="text-flow text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">{product.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-3xl font-extrabold text-blue-400" dir="ltr">{product.price.toFixed(2)} MAD</p>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isAvailable ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                {isAvailable ? t("stock.in") : t("stock.out")}
              </span>
            </div>

            <ProductPurchase productId={product.id} stock={isAvailable ? product.stock : 0} />

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-[#0b1220] p-3 text-[11px] text-slate-300 sm:text-xs">
              <Info icon={Truck} text={t("product.shipping")} />
              <Info icon={Banknote} text={t("product.payment")} />
              <Info icon={Headset} text={t("product.support")} />
            </div>

            <div className="mt-5">
              <h2 className="text-sm font-bold text-white">{t("product.description")}</h2>
              <p dir="auto" className="text-flow mt-2 whitespace-pre-line text-sm leading-7 text-slate-300">
                {product.description || t("product.defaultDescription")}
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <Feature text={t("product.original")} />
                <Feature text={t("product.feature1")} />
                <Feature text={t("product.feature3")} />
              </div>
            </div>

            {details.length > 0 && (
              <dl className="mt-5 divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0b1220] text-xs">
                {details.map((detail) => (
                  <div key={detail.label} className="flex gap-3 px-3 py-2.5">
                    <dt className="w-24 shrink-0 text-slate-500">{detail.label}</dt>
                    <dd dir="auto" className="text-flow font-semibold text-white">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-800 py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.14em] text-blue-400 sm:text-xs">{t("product.alsoLike")}</p>
                <h2 className="mt-1 text-xl font-extrabold text-white md:text-2xl">{t("product.related")}</h2>
              </div>
              <Link href="/store" className="shrink-0 text-sm font-bold text-blue-400 transition hover:text-blue-300">{t("product.viewAll")}</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} id={item.id} slug={item.slug} name={item.name} category={item.category} price={`${item.price.toFixed(2)} MAD`} inStock={item.stock > 0} image={item.image} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <Check size={16} className="mt-1 shrink-0 text-blue-400" strokeWidth={2.6} />
      <span>{text}</span>
    </div>
  );
}

function Info({ icon: Icon, text }: { icon: typeof Truck; text: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Icon size={18} className="text-blue-400" />
      <span className="leading-tight">{text}</span>
    </div>
  );
}
