import type { Metadata } from "next";
import { Coins, KeyRound, Search, SearchCheck, ShieldCheck } from "lucide-react";
import CategoryChips from "@/components/store/CategoryChips";
import ServiceRow from "@/components/services/ServiceRow";
import { gsmCategoryKey, gsmServiceCategories, isGsmServiceCategory } from "@/lib/gsm-services";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "IMEI, Credits & Tool Rental",
  description: "Professional GSM device checks, server credits and tool rentals paid with RepairCore balance.",
};

const groupIcons = { IMEI: SearchCheck, SERVER_CREDIT: Coins, TOOL_RENTAL: KeyRound } as const;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const selectedCategory = isGsmServiceCategory(category) ? category : undefined;
  const query = search?.trim() || undefined;
  const [services, { t, tKey }] = await Promise.all([
    prisma.gsmService.findMany({
      where: {
        status: "ACTIVE",
        ...(selectedCategory ? { category: selectedCategory } : {}),
        ...(query ? { name: { contains: query, mode: "insensitive" as const } } : {}),
      },
      orderBy: [{ category: "asc" }, { price: "asc" }],
    }),
    getT(),
  ]);

  // One price list per category, in the catalog's order.
  const groups = gsmServiceCategories
    .map((item) => ({ ...item, services: services.filter((service) => service.category === item.value) }))
    .filter((group) => group.services.length > 0);

  const chipHref = (value?: string) => {
    const params = new URLSearchParams();
    if (value) params.set("category", value);
    if (query) params.set("search", query);
    const encoded = params.toString();
    return encoded ? `/services?${encoded}` : "/services";
  };

  return (
    <main className="min-h-screen bg-[#070d18] px-4 py-6 sm:px-6 md:py-10">
      <section className="mx-auto max-w-5xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300 sm:text-xs">
          <ShieldCheck size={14} /> {t("services.badge")}
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white md:text-4xl">{t("services.title")}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">{t("services.subtitle")}</p>

        <form action="/services" className="mt-5 flex gap-2">
          {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
          <label className="relative flex-1">
            <span className="sr-only">{t("services.searchLabel")}</span>
            <Search size={17} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              name="search"
              defaultValue={query}
              placeholder={t("services.searchPlaceholder")}
              className="w-full rounded-lg border border-slate-700 bg-[#0b1220] py-2.5 ps-10 pe-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </label>
          <button className="rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500">
            {t("services.searchButton")}
          </button>
        </form>

        <CategoryChips
          className="mt-4"
          chips={[
            { href: chipHref(), label: t("services.all"), active: !selectedCategory },
            ...gsmServiceCategories.map((item) => ({
              href: chipHref(item.value),
              label: tKey(gsmCategoryKey(item.value), item.label),
              active: selectedCategory === item.value,
            })),
          ]}
        />

        {groups.length === 0 ? (
          <p className="mt-16 text-center text-slate-400">{t("services.empty")}</p>
        ) : (
          <div className="mt-6 space-y-6">
            {groups.map((group) => {
              const Icon = groupIcons[group.value];
              return (
                <section key={group.value} aria-labelledby={`group-${group.value}`}>
                  <h2 id={`group-${group.value}`} className="mb-2 flex items-center gap-2 text-base font-bold text-white md:text-lg">
                    <Icon size={18} className="text-blue-400" />
                    {tKey(gsmCategoryKey(group.value), group.label)}
                    <span className="text-xs font-medium text-slate-500">{t("services.count", { count: group.services.length })}</span>
                  </h2>
                  <div className="divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220]">
                    {group.services.map((service) => (
                      <ServiceRow
                        key={service.id}
                        slug={service.slug}
                        name={service.name}
                        category={service.category}
                        provider={service.provider}
                        estimatedTime={service.estimatedTime}
                        price={service.price.toFixed(2)}
                        orderLabel={t("services.orderButton")}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-6 text-amber-100/80 md:text-sm">
          {t("services.legal")}
        </div>
      </section>
    </main>
  );
}
