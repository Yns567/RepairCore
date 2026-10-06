import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, ShieldCheck, WalletCards } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { gsmCategoryKey } from "@/lib/gsm-services";
import { getT } from "@/lib/i18n/server";
import ServiceOrderForm from "@/components/services/ServiceOrderForm";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.gsmService.findUnique({ where: { slug } });
  if (!service || service.status !== "ACTIVE") notFound();
  const { t, tKey } = await getT();

  const notes = (
    <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4 text-sm leading-6 text-slate-400">
      <p className="font-semibold text-white">{t("services.before")}</p>
      <ul className="mt-2 list-disc space-y-1.5 ps-5">
        <li>{t("services.before1")}</li>
        <li>{t("services.before2")}</li>
        <li>{t("services.before3")}</li>
      </ul>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#070d18] px-4 py-5 sm:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/services" className="text-sm font-medium text-blue-400 hover:text-blue-300">{t("services.back")}</Link>

        <div className="mt-4 grid gap-5 lg:mt-6 lg:grid-cols-[1fr_26rem] lg:gap-8">
          <section>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300 sm:text-xs">
              {tKey(gsmCategoryKey(service.category), service.category)}
            </span>
            <h1 dir="auto" className="text-flow mt-3 text-2xl font-extrabold leading-tight tracking-tight text-white md:mt-5 md:text-4xl">{service.name}</h1>
            {service.description && (
              <p dir="auto" className="text-flow mt-2 max-w-3xl text-sm leading-6 text-slate-400 md:mt-4 md:text-base md:leading-7">{service.description}</p>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 md:mt-7 md:gap-4">
              <Info icon={<Clock3 size={18} />} label={t("services.time")} value={service.estimatedTime} />
              <Info icon={<WalletCards size={18} />} label={t("services.payment")} value={t("services.paymentValue")} />
              <Info icon={<ShieldCheck size={18} />} label={t("services.protection")} value={t("services.protectionValue")} />
            </div>
            <div className="mt-6 hidden lg:block">{notes}</div>
          </section>

          {/* On phones the order form comes right after the title, where the customer expects it. */}
          <aside className="h-fit rounded-2xl border border-slate-800 bg-[#111827] p-4 shadow-xl sm:p-6 lg:sticky lg:top-32">
            <div className="flex items-end justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">{t("services.total")}</p>
                <p className="mt-1 text-3xl font-extrabold text-white" dir="ltr">${service.price.toFixed(2)}</p>
              </div>
              {service.provider && <p dir="auto" className="text-xs text-slate-400">{service.provider}</p>}
            </div>
            <div className="mt-4">
              <ServiceOrderForm serviceId={service.id} slug={service.slug} inputType={service.inputType} price={service.price.toString()} />
            </div>
          </aside>

          <div className="lg:hidden">{notes}</div>
        </div>
      </div>
    </main>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-2.5 md:p-4">
      <div className="text-blue-400">{icon}</div>
      <p className="mt-2 text-[10px] leading-tight text-slate-500 md:mt-3 md:text-xs">{label}</p>
      <p dir="auto" className="text-flow mt-1 text-xs font-semibold leading-tight text-white md:text-sm">{value}</p>
    </div>
  );
}
