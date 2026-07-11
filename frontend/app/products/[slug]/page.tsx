import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, Heart, ShieldCheck, Star, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import ProductPurchase from "@/components/cart/ProductPurchase";
import ProductCard from "@/components/store/ProductCard";
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

  const relatedProducts = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      category: product.category,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const isAvailable = product.status === "ACTIVE" && product.stock > 0;
  const details = [
    product.brand && { label: "Brand", value: product.brand },
    product.category && { label: "Category", value: product.category },
    product.partNumber && { label: "Part number", value: product.partNumber },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail));

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
          <Link href="/" className="transition hover:text-blue-600">Home</Link>
          <ChevronRight size={14} />
          <Link href="/store" className="transition hover:text-blue-600">Store</Link>
          {product.category && <><ChevronRight size={14} /><span>{product.category}</span></>}
          <ChevronRight size={14} />
          <span className="max-w-48 truncate text-slate-800">{product.name}</span>
        </nav>

        <section className="mt-6 grid gap-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7 lg:grid-cols-[1.08fr_.92fr] lg:gap-12">
          <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-5">
            <div className="flex flex-col gap-3 pt-3">
              <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-blue-600 bg-slate-50 p-1.5">
                <Image src={product.image || "/placeholder.png"} alt="" fill sizes="72px" className="object-contain" />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1.5 opacity-65">
                <Image src={product.image || "/placeholder.png"} alt="" fill sizes="72px" className="object-contain" />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1.5 opacity-40">
                <Image src={product.image || "/placeholder.png"} alt="" fill sizes="72px" className="object-contain" />
              </div>
            </div>

            <div className="relative flex min-h-[310px] items-center justify-center overflow-hidden rounded-xl bg-[#f7f9fd] p-6 sm:min-h-[455px] sm:p-10">
              <div className="absolute h-4/5 w-4/5 rounded-full bg-blue-100/70 blur-3xl" />
              <Image
                src={product.image || "/placeholder.png"}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="relative object-contain p-4"
              />
              {product.category && <span className="absolute left-4 top-4 rounded-md bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 shadow-sm ring-1 ring-slate-200">{product.category}</span>}
            </div>
          </div>

          <div className="flex flex-col py-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} fill="currentColor" />)}
              </div>
              <span className="text-xs text-slate-500">4.9 (128 reviews)</span>
              <span className={`text-xs font-bold ${isAvailable ? "text-emerald-600" : "text-rose-600"}`}>{isAvailable ? "In Stock" : "Out of Stock"}</span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-3xl font-extrabold text-blue-600">${Number(product.price).toFixed(2)}</p>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              {product.description || "Professional repair equipment selected for technicians who need reliable and precise results."}
            </p>

            <div className="mt-5 space-y-2.5 text-sm text-slate-600">
              <Feature text="Professional-grade quality for daily repair work" />
              <Feature text="Reliable performance and easy setup" />
              <Feature text="Technical support from repair specialists" />
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
          <div className="flex flex-wrap gap-x-7 gap-y-3 border-b border-slate-200 pb-4 text-sm font-bold">
            <span className="border-b-2 border-blue-600 pb-4 text-blue-600">Description</span>
            <span className="text-slate-500">Additional Information</span>
            <span className="text-slate-500">Reviews (128)</span>
            <span className="text-slate-500">Shipping &amp; Returns</span>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-sm leading-7 text-slate-600">{product.description || "A reliable professional tool for modern mobile and electronics repair workflows. Every product is checked before dispatch to give technicians dependable equipment from the first use."}</p>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <Feature text="Original product guarantee" />
                <Feature text="Fast, tracked delivery" />
              </div>
            </div>
            <div className="grid gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 sm:grid-cols-2 md:grid-cols-1">
              <Info icon={Truck} text="Worldwide shipping available" />
              <Info icon={ShieldCheck} text="Secure payment options" />
              <Info icon={Heart} text="Dedicated technical support" />
            </div>
          </div>
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="bg-[#070d18] py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-400">You may also like</p>
                <h2 className="mt-1 text-2xl font-extrabold text-white">Related Products</h2>
              </div>
              <Link href="/store" className="text-sm font-bold text-blue-400 transition hover:text-blue-300">View all products →</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} id={item.id} slug={item.slug} name={item.name} category={item.category ?? "Tools"} price={`$${Number(item.price).toFixed(2)}`} stock={item.stock > 0 ? "In Stock" : "Out of Stock"} image={item.image} />
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
