"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, CircleUserRound, Grid2X2, Menu, Search, ShieldCheck, ShoppingCart, X } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import LanguageSwitcher from "./LanguageSwitcher";

const storeLinks: { href: string; label: MessageKey }[] = [
  { href: "/store?category=programmers", label: "nav.programmers" },
  { href: "/store?category=boxes", label: "nav.boxesDongles" },
  { href: "/store?category=tools", label: "nav.repairTools" },
  { href: "/store?category=spare-parts", label: "nav.spareParts" },
  { href: "/store?category=accessories", label: "nav.accessories" },
  { href: "/store?sort=new", label: "nav.newArrivals" },
  { href: "/software", label: "nav.softwareRentals" },
  { href: "/brands", label: "nav.brands" },
];

const serviceLinks: { href: string; label: MessageKey }[] = [
  { href: "/services?category=IMEI", label: "nav.imeiServices" },
  { href: "/services?category=SERVER_CREDIT", label: "nav.toolCredits" },
  { href: "/services?category=TOOL_RENTAL", label: "nav.toolRent" },
  { href: "/account/services", label: "nav.myServiceOrders" },
];

export default function MobileNav({ cartItemCount }: { cartItemCount: number }) {
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

  const linkClass = "flex items-center justify-between border-b border-slate-800/80 py-4 text-sm font-medium text-slate-200 transition hover:text-blue-400";

  return (
    <>
      <button
        type="button"
        className="ms-auto rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white md:hidden"
        aria-label={t("nav.open")}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={25} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm md:hidden"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <aside
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.mobile")}
            className="ms-auto flex h-full w-[min(22rem,88vw)] flex-col overflow-y-auto border-s border-slate-700 bg-[#0b1220] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
              <span className="text-lg font-extrabold tracking-tight text-white">REPAIRCORE</span>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white" aria-label={t("nav.close")}>
                <X size={22} />
              </button>
            </div>

            <form action="/store" className="relative mx-5 mt-5">
              <Search size={17} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="search" placeholder={t("nav.search")} className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 ps-10 pe-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500" />
            </form>

            <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
              <Link href="/account" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-3 text-sm font-medium text-slate-200 hover:border-blue-500 hover:text-white">
                <CircleUserRound size={18} /> {t("nav.account")}
              </Link>
              <Link href="/cart" onClick={() => setIsOpen(false)} className="relative flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500">
                <ShoppingCart size={18} /> {t("nav.cart")}
                {cartItemCount > 0 && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{cartItemCount}</span>}
              </Link>
            </div>

            <LanguageSwitcher className="mx-5 mt-4" />

            <nav className="mt-6 border-t border-slate-800 px-5 py-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500"><Grid2X2 size={14} /> {t("nav.shopCategories")}</p>
              {storeLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={linkClass}>
                  {t(link.label)}
                  <ChevronRight size={17} className="text-slate-500 rtl:rotate-180" />
                </Link>
              ))}

              <p className="mb-2 mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400"><ShieldCheck size={14} /> {t("nav.gsmServices")}</p>
              {serviceLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={linkClass}>
                  {t(link.label)}
                  <ChevronRight size={17} className="text-slate-500 rtl:rotate-180" />
                </Link>
              ))}

              <Link href="/contact" onClick={() => setIsOpen(false)} className="flex items-center justify-between py-4 text-sm font-medium text-slate-200 transition hover:text-blue-400">
                {t("nav.contact")}
                <ChevronRight size={17} className="text-slate-500 rtl:rotate-180" />
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
