"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CircleUserRound,
  GraduationCap,
  Grid2X2,
  LayoutGrid,
  Menu,
  Package,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import LanguageSwitcher from "./LanguageSwitcher";

type NavLink = { href: string; label: MessageKey };

// Quick-access cards at the top of the drawer.
const quickLinks: { href: string; label: MessageKey; icon: typeof CircleUserRound }[] = [
  { href: "/account", label: "nav.account", icon: CircleUserRound },
  { href: "/orders", label: "nav.orders", icon: Package },
  { href: "/account/wallet", label: "nav.wallet", icon: Wallet },
];

const shopLinks: NavLink[] = [
  { href: "/store", label: "nav.allProducts" },
  { href: "/store?category=programmers", label: "nav.programmers" },
  { href: "/store?category=boxes", label: "nav.boxesDongles" },
  { href: "/store?category=tools", label: "nav.repairTools" },
  { href: "/store?category=spare-parts", label: "nav.spareParts" },
  { href: "/store?category=accessories", label: "nav.accessories" },
  { href: "/store?sort=new", label: "nav.newArrivals" },
  { href: "/brands", label: "nav.brands" },
];

const serviceLinks: NavLink[] = [
  { href: "/services", label: "services.all" },
  { href: "/services?category=IMEI", label: "nav.imeiServices" },
  { href: "/services?category=SERVER_CREDIT", label: "nav.toolCredits" },
  { href: "/services?category=TOOL_RENTAL", label: "nav.toolRent" },
  { href: "/account/services", label: "nav.myServiceOrders" },
];

const moreLinks: NavLink[] = [
  { href: "/software", label: "nav.softwareRentals" },
  { href: "/learning", label: "nav.courses" },
  { href: "/account/wallet/top-up", label: "nav.topUp" },
  { href: "/contact", label: "nav.contact" },
];

const legalLinks: NavLink[] = [
  { href: "/terms", label: "legal.terms" },
  { href: "/refunds", label: "legal.refunds" },
  { href: "/privacy", label: "legal.privacy" },
];

export default function MobileNav() {
  const { t } = useT();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        className="-ms-2 rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white md:hidden"
        aria-label={t("nav.open")}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm md:hidden"
          role="presentation"
          onClick={close}
        >
          <aside
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.mobile")}
            className="me-auto flex h-full w-[min(21rem,88vw)] flex-col overflow-y-auto border-e border-slate-700 bg-[#0b1220] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-[#0b1220] px-5 py-4">
              <span className="text-lg font-extrabold tracking-tight text-white">{t("nav.menu")}</span>
              <div className="flex items-center gap-3">
                <LanguageSwitcher size="sm" />
                <button type="button" onClick={close} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white" aria-label={t("nav.close")}>
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Quick-access cards */}
            <div className="grid grid-cols-3 gap-2 px-5 pt-4">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-[#111827] p-3 text-center text-[11px] font-semibold text-slate-200 transition hover:border-blue-500 hover:text-white"
                >
                  <Icon size={20} className="text-blue-400" />
                  {t(label)}
                </Link>
              ))}
            </div>

            <nav className="px-5 py-2">
              <Section title={t("nav.storeShort")} icon={<ShoppingBag size={14} />} links={shopLinks} t={t} onNavigate={close} />
              <Section title={t("nav.gsmServices")} icon={<ShieldCheck size={14} />} links={serviceLinks} t={t} onNavigate={close} accent />
              <Section title={t("nav.more")} icon={<LayoutGrid size={14} />} links={moreLinks} t={t} onNavigate={close} />
              <Section title={t("footer.legal")} icon={<Grid2X2 size={14} />} links={legalLinks} t={t} onNavigate={close} muted />
            </nav>

            <div className="mt-auto flex items-center gap-2 border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
              <GraduationCap size={14} className="text-blue-400" />
              {t("footer.about")}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Section({
  title,
  icon,
  links,
  t,
  onNavigate,
  accent = false,
  muted = false,
}: {
  title: string;
  icon: React.ReactNode;
  links: NavLink[];
  t: (key: MessageKey) => string;
  onNavigate: () => void;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="py-3">
      <p className={`mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${accent ? "text-blue-400" : "text-slate-500"}`}>{icon} {title}</p>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={`flex items-center justify-between border-b border-slate-800/70 py-3 font-medium transition last:border-0 hover:text-blue-400 ${muted ? "text-xs text-slate-400" : "text-sm text-slate-200"}`}
        >
          {t(link.label)}
          <ChevronRight size={16} className="text-slate-500 rtl:rotate-180" />
        </Link>
      ))}
    </div>
  );
}
