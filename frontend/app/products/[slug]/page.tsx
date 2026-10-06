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
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <nav aria-label={t("product.breadcrumb")} className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
          <Link href="/" className="transition hover:text-blue-600">{t("product.home")}</Link>
          <ChevronRight size={14} className="rtl:rotate-180" />
          <Link href="/store" className="transition hover:text-blue-600">{t("store.title")}</Link>
          {categoryLabel && <><ChevronRight size={14} className="rtl:rotate-180" /><span>{categoryLabel}</span></>}
          <ChevronRight size={14} className="rtl:rotate-180" />
          <span className="max-w-48 truncate text-slate-800">{product.name}</span>
        </nav>

        <section className="mt-6 grid gap-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7 lg:grid-cols-[1.08fr_.92fr] lg:gap-12">
          <ProductGallery
            key={product.id}
            images={productImages}
            productName={product.name}
            category={categoryLabel}
          />

          <div className="flex flex-col py-1">
            <span className={`text-xs font-bold ${isAvailable ? "text-emerald-600" : "text-rose-600"}`}>
              {isAvailable ? t("stock.in") : t("stock.out")}
            </span>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-3xl font-extrabold text-blue-600" dir="ltr">{product.price.toFixed(2)} MAD</p>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              {product.description || t("product.defaultDescription")}
            </p>

            <div className="mt-5 space-y-2.5 text-sm text-slate-600">
              <Feature text={t("product.feature1")} />
              <Feature text={t("product.feature2")} />
              <Feature text={t("product.feature3")} />
            </div>

            <ProductPurchase productId={product.id} stock={isAvailable ? product.stock : 0} />

            <div className="mt-6 border-t border-slate-200 pt-5">
              {details.map((detail) => (
                <div key={detail.label} className="flex gap-3 py-1 text-xs">
                  <span className="w-24 text-slate-500">{detail.label}:</span>
                  <span className="font-semibold text-slate-800">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="border-b border-slate-200 pb-4 text-sm font-bold text-blue-600">{t("product.description")}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-sm leading-7 text-slate-600">{product.description || t("product.defaultDescription")}</p>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <Feature text={t("product.original")} />
                <Feature text={t("product.delivery")} />
              </div>
            </div>
            <div className="grid gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 sm:grid-cols-2 md:grid-cols-1">
              <Info icon={Truck} text={t("product.shipping")} />
              <Info icon={Banknote} text={t("product.payment")} />
              <Info icon={Headset} text={t("product.support")} />
            </div>
          </div>
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="bg-[#070d18] py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-400">{t("product.alsoLike")}</p>
                <h2 className="mt-1 text-2xl font-extrabold text-white">{t("product.related")}</h2>
              </div>
              <Link href="/store" className="text-sm font-bold text-blue-400 transition hover:text-blue-300">{t("product.viewAll")}</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      <Check size={16} className="mt-0.5 shrink-0 text-blue-600" strokeWidth={2.6} />
      <span>{text}</span>
    </div>
  );
}

function Info({ icon: Icon, text }: { icon: typeof Truck; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} className="text-blue-600" />
      <span>{text}</span>
    </div>
  );
}
