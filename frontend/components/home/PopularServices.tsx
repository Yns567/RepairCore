import Link from "next/link";
import ServiceRow from "@/components/services/ServiceRow";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

/** GSM shops put their service price list on the home page; this shows the cheapest entry points. */
export default async function PopularServices() {
  const [services, { t }] = await Promise.all([
    prisma.gsmService.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ price: "asc" }],
      take: 6,
    }),
    getT(),
  ]);

  if (services.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-12">
      <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-500 sm:text-xs">{t("home.servicesKicker")}</span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:mt-2 md:text-3xl">{t("home.servicesTitle")}</h2>
        </div>
        <Link href="/services" className="shrink-0 text-sm font-medium text-blue-400 hover:text-blue-300">{t("home.allServices")}</Link>
      </div>

      <div className="divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800 bg-[#0B1220] lg:grid lg:grid-cols-2 lg:divide-y-0">
        {services.map((service) => (
          <div key={service.id} className="lg:border-b lg:border-slate-800 lg:odd:border-e">
            <ServiceRow
              slug={service.slug}
              name={service.name}
              category={service.category}
              provider={service.provider}
              estimatedTime={service.estimatedTime}
              price={service.price.toFixed(2)}
              orderLabel={t("services.orderButton")}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
