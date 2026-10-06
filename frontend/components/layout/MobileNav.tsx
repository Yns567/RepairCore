"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, CircleUserRound, Grid2X2, Menu, ShieldCheck, X } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import LanguageSwitcher from "./LanguageSwitcher";

type NavLink = { href: string; label: MessageKey };

const storeLinks: NavLink[] = [
  { href: "/store?category=programmers", label: "nav.programmers" },
  { href: "/store?category=boxes", label: "nav.boxesDongles" },
  { href: "/store?category=tools", label: "nav.repairTools" },
  { href: "/store?category=spare-parts", label: "nav.spareParts" },
  { href: "/store?category=accessories", label: "nav.accessories" },
  { href: "/store?sort=new", label: "nav.newArrivals" },
  { href: "/software", label: "nav.softwareRentals" },
  { href: "/brands", label: "nav.brands" },
];

const serviceLinks: NavLink[] = [
  { href: "/services?category=IMEI", label: "nav.imeiServices" },
  { href: "/services?category=SERVER_CREDIT", label: "nav.toolCredits" },
  { href: "/services?category=TOOL_RENTAL", label: "nav.toolRent" },
];

const accountLinks: NavLink[] = [
  { href: "/orders", label: "nav.orders" },
  { href: "/account/services", label: "nav.myServiceOrders" },
  { href: "/account/wallet", label: "nav.wallet" },
  { href: "/account/wallet/top-up", label: "nav.topUp" },
  { href: "/contact", label: "nav.contact" },
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
            className="me-auto flex h-full w-[min(20rem,85vw)] flex-col overflow-y-auto border-e border-slate-700 bg-[#0b1220] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <span className="text-lg font-extrabold tracking-tight text-white">{t("nav.menu")}</span>
              <button type="button" onClick={close} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white" aria-label={t("nav.close")}>
                <X size={22} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-3">
              <Link href="/account" onClick={close} className="flex items-center gap-2 text-sm font-semibold text-white">
                <CircleUserRound size={18} className="text-blue-400" /> {t("nav.account")}
              </Link>
              <LanguageSwitcher size="sm" />
            </div>

            <nav className="px-5 py-2">
              <Section title={t("nav.shopCategories")} icon={<Grid2X2 size={14} />} links={storeLinks} t={t} onNavigate={close} />
              <Section title={t("nav.gsmServices")} icon={<ShieldCheck size={14} />} links={serviceLinks} t={t} onNavigate={close} accent />
              <Section title={t("nav.account")} icon={<CircleUserRound size={14} />} links={accountLinks} t={t} onNavigate={close} />
            </nav>
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
}: {
  title: string;
  icon: React.ReactNode;
  links: NavLink[];
  t: (key: MessageKey) => string;
  onNavigate: () => void;
  accent?: boolean;
}) {
  return (
    <div className="py-3">
      <p className={`mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${accent ? "text-blue-400" : "text-slate-500"}`}>{icon} {title}</p>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="flex items-center justify-between border-b border-slate-800/70 py-3 text-sm font-medium text-slate-200 transition last:border-0 hover:text-blue-400"
        >
          {t(link.label)}
          <ChevronRight size={16} className="text-slate-500 rtl:rotate-180" />
        </Link>
      ))}
    </div>
  );
}
