import Link from "next/link";
import { Mail, MessageCircle, Phone, Wrench } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { SITE, whatsappLink } from "@/lib/site";

export default async function Footer() {
  const { t } = await getT();

  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#070d18] text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-8 sm:px-6 md:py-12 lg:grid-cols-[1.3fr_1fr_1fr_1.15fr]">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600">
              <Wrench size={19} />
            </span>
            <span className="font-extrabold tracking-tight">REPAIRCORE</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">{t("footer.about")}</p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">{t("footer.shop")}</h2>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/store?category=programmers" className="hover:text-blue-400">{t("nav.programmers")}</Link>
            <Link href="/store?category=boxes" className="hover:text-blue-400">{t("nav.boxesDongles")}</Link>
            <Link href="/store?category=tools" className="hover:text-blue-400">{t("nav.repairTools")}</Link>
            <Link href="/software" className="hover:text-blue-400">{t("footer.software")}</Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">{t("nav.gsmServices")}</h2>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/services?category=IMEI" className="hover:text-blue-400">{t("footer.imeiChecks")}</Link>
            <Link href="/services?category=SERVER_CREDIT" className="hover:text-blue-400">{t("nav.toolCredits")}</Link>
            <Link href="/services?category=TOOL_RENTAL" className="hover:text-blue-400">{t("footer.toolRental")}</Link>
            <Link href="/account/services" className="hover:text-blue-400">{t("nav.myServiceOrders")}</Link>
            <Link href="/image-credits" className="hover:text-blue-400">{t("footer.imageCredits")}</Link>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">{t("nav.contact")}</h2>
          <div className="mt-3 grid gap-2.5 text-sm">
            <a href={`tel:${SITE.phone}`} className="inline-flex items-center gap-2 hover:text-blue-400" dir="ltr">
              <Phone size={16} className="text-blue-400" /> {SITE.phone}
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-blue-400">
              <MessageCircle size={16} className="text-emerald-400" /> {t("contact.whatsapp")}
            </a>
            <a href={`mailto:${SITE.supportEmail}`} className="inline-flex items-center gap-2 break-all hover:text-blue-400">
              <Mail size={16} className="shrink-0 text-blue-400" /> {SITE.supportEmail}
            </a>
            <Link href="/contact" className="mt-1 font-medium text-blue-400 hover:text-blue-300">{t("footer.contactPage")}</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        <nav aria-label={t("footer.legal")} className="mb-2 flex flex-wrap justify-center gap-x-5 gap-y-1">
          <Link href="/terms" className="hover:text-slate-300">{t("legal.terms")}</Link>
          <Link href="/refunds" className="hover:text-slate-300">{t("legal.refunds")}</Link>
          <Link href="/privacy" className="hover:text-slate-300">{t("legal.privacy")}</Link>
        </nav>
        {t("footer.rights", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
