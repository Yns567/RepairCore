import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Brands",
  description: "Browse repair tools and parts by brand at RepairCore.",
};

export default async function BrandsPage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });

  const brands = products.flatMap((product) => (product.brand ? [product.brand] : []));

  return (
    <main className="min-h-[calc(100vh-120px)] bg-[#070d18] px-6 py-16">
      <section className="mx-auto max-w-7xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Catalog</span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">Browse by brand</h1>
        <p className="mt-4 max-w-2xl text-slate-400">Choose a trusted repair-tool, box or phone-parts brand to view its available products.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/store?brand=${encodeURIComponent(brand)}`}
              className="group flex items-center justify-between rounded-xl border border-slate-800 bg-[#0b1220] p-5 transition hover:-translate-y-1 hover:border-blue-500"
            >
              <span className="inline-flex items-center gap-3 font-semibold text-white">
                <BadgeCheck size={20} className="text-blue-400" /> {brand}
              </span>
              <ArrowRight size={18} className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-400" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
