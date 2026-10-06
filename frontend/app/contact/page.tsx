import type { Metadata } from "next";
import { Mail, MessageCircle, MessageCircleMore, Phone, Wrench } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact RepairCore for products, software subscriptions and rentals.",
};

export default async function ContactPage() {
  const { t } = await getT();
  return (
    <main className="min-h-[calc(100vh-120px)] bg-[#070d18] px-4 sm:px-6 py-6 md:py-12">
      <section className="mx-auto max-w-5xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
          <Wrench size={14} /> {t("contact.badge")}
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          {t("contact.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
          {t("contact.subtitle")}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <a
            href={`tel:${SITE.phone}`}
            className="group rounded-2xl border border-slate-800 bg-[#0b1220] p-7 transition hover:-translate-y-1 hover:border-blue-500"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white"><Phone size={22} /></span>
            <h2 className="mt-5 text-xl font-bold text-white">{t("contact.phone")}</h2>
            <p className="mt-2 text-sm text-slate-400">{t("contact.phoneText")}</p>
            <p className="mt-5 text-lg font-semibold text-blue-400" dir="ltr">{SITE.phone}</p>
          </a>

          <a
            href={`mailto:${SITE.supportEmail}`}
            className="group rounded-2xl border border-slate-800 bg-[#0b1220] p-7 transition hover:-translate-y-1 hover:border-blue-500"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white"><Mail size={22} /></span>
            <h2 className="mt-5 text-xl font-bold text-white">{t("contact.email")}</h2>
            <p className="mt-2 text-sm text-slate-400">{t("contact.emailText")}</p>
            <p className="mt-5 break-all text-lg font-semibold text-blue-400">{SITE.supportEmail}</p>
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-emerald-700/50 bg-[#0b1220] p-7 transition hover:-translate-y-1 hover:border-emerald-500"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-600 text-white"><MessageCircle size={22} /></span>
            <h2 className="mt-5 text-xl font-bold text-white">{t("contact.whatsapp")}</h2>
            <p className="mt-2 text-sm text-slate-400">{t("contact.whatsappText")}</p>
            <p className="mt-5 text-lg font-semibold text-emerald-400" dir="ltr">{SITE.phone}</p>
          </a>
        </div>

        <div className="mt-8 flex gap-3 rounded-2xl border border-slate-800 bg-[#101a2d] p-5 text-sm text-slate-300">
          <MessageCircleMore className="mt-0.5 shrink-0 text-blue-400" size={20} />
          <p>{t("contact.tip")}</p>
        </div>
      </section>
    </main>
  );
}
