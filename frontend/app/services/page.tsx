import type { Metadata } from "next";
import Link from "next/link";
import { Search, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { gsmCategoryKey, gsmServiceCategories, isGsmServiceCategory } from "@/lib/gsm-services";
import { getT } from "@/lib/i18n/server";
import ServiceCard from "@/components/services/ServiceCard";

export const metadata: Metadata = {
  title: "IMEI, Credits & Tool Rental",
  description: "Professional GSM device checks, server credits and tool rentals paid with RepairCore balance.",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const selectedCategory = isGsmServiceCategory(category) ? category : undefined;
  const { t, tKey } = await getT();
  const services = await prisma.gsmService.findMany({
    where: {
      status: "ACTIVE",
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(search?.trim()
        ? { name: { contains: search.trim(), mode: "insensitive" as const } }
        : {}),
    },
    orderBy: [{ category: "asc" }, { price: "asc" }],
  });

  return (
    <main className="min-h-screen bg-[#070d18] px-6 py-14">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300"><ShieldCheck size={14} /> {t("services.badge")}</span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white md:text-5xl">{t("services.title")}</h1>
          <p className="mt-4 text-base leading-7 text-slate-400">{t("services.subtitle")}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/services" className={`rounded-full px-4 py-2 text-sm font-semibold ${!selectedCategory ? "bg-blue-600 text-white" : "border border-slate-700 text-slate-300 hover:border-blue-500"}`}>{t("services.all")}</Link>
          {gsmServiceCategories.map((item) => (
            <Link key={item.value} href={`/services?category=${item.value}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === item.value ? "bg-blue-600 text-white" : "border border-slate-700 text-slate-300 hover:border-blue-500"}`}>{tKey(gsmCategoryKey(item.value), item.label)}</Link>
          ))}
        </div>

        <form action="/services" className="mt-7 flex max-w-2xl gap-3">
          {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
          <label className="relative flex-1">
            <span className="sr-only">{t("services.searchLabel")}</span>
            <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              name="search"
              defaultValue={search}
              placeholder={t("services.searchPlaceholder")}
              className="w-full rounded-xl border border-slate-700 bg-[#0b1220] py-3 ps-11 pe-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </label>
          <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">
            {t("services.searchButton")}
          </button>
        </form>

        {services.length === 0 ? (
          <p className="mt-16 text-center text-slate-400">{t("services.empty")}</p>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => <ServiceCard key={service.id} name={service.name} slug={service.slug} description={service.description} category={service.category} provider={service.provider} estimatedTime={service.estimatedTime} price={service.price.toString()} />)}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-6 text-amber-100/80">
          {t("services.legal")}
        </div>
      </section>
    </main>
  );
}
