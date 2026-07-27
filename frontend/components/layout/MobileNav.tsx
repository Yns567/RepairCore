"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, CircleUserRound, Grid2X2, Menu, Search, ShieldCheck, ShoppingCart, X } from "lucide-react";

const storeLinks = [
  { href: "/store?category=programmers", label: "Programmers" },
  { href: "/store?category=boxes", label: "Boxes & Dongles" },
  { href: "/store?category=tools", label: "Repair Tools" },
  { href: "/store?category=spare-parts", label: "Spare Parts" },
  { href: "/store?category=accessories", label: "Accessories" },
  { href: "/store?sort=new", label: "New Arrivals" },
  { href: "/software", label: "Software & Rentals" },
  { href: "/brands", label: "Brands" },
];

const serviceLinks = [
  { href: "/services?category=IMEI", label: "IMEI Services" },
  { href: "/services?category=SERVER_CREDIT", label: "Tool Credits" },
  { href: "/services?category=TOOL_RENTAL", label: "Tool Rent" },
  { href: "/account/services", label: "My Service Orders" },
];

export default function MobileNav({ cartItemCount }: { cartItemCount: number }) {
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

  return (
    <>
      <button
        type="button"
        className="ml-auto rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white md:hidden"
        aria-label="Open navigation"
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
            aria-label="Mobile navigation"
            className="ml-auto flex h-full w-[min(22rem,88vw)] flex-col overflow-y-auto border-l border-slate-700 bg-[#0b1220] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
              <span className="text-lg font-extrabold tracking-tight text-white">REPAIRCORE</span>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white" aria-label="Close navigation">
                <X size={22} />
              </button>
            </div>

            <form action="/store" className="relative mx-5 mt-5">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="search" placeholder="Search products..." className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500" />
            </form>

            <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
              <Link href="/account" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-3 text-sm font-medium text-slate-200 hover:border-blue-500 hover:text-white">
                <CircleUserRound size={18} /> Account
              </Link>
              <Link href="/cart" onClick={() => setIsOpen(false)} className="relative flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500">
                <ShoppingCart size={18} /> Cart
                {cartItemCount > 0 && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{cartItemCount}</span>}
              </Link>
            </div>

            <nav className="mt-6 border-t border-slate-800 px-5 py-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500"><Grid2X2 size={14} /> Shop categories</p>
              {storeLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="flex items-center justify-between border-b border-slate-800/80 py-4 text-sm font-medium text-slate-200 transition hover:text-blue-400">
                  {link.label}
                  <ChevronRight size={17} className="text-slate-500" />
                </Link>
              ))}

              <p className="mb-2 mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400"><ShieldCheck size={14} /> GSM services</p>
              {serviceLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="flex items-center justify-between border-b border-slate-800/80 py-4 text-sm font-medium text-slate-200 transition hover:text-blue-400">
                  {link.label}
                  <ChevronRight size={17} className="text-slate-500" />
                </Link>
              ))}

              <Link href="/contact" onClick={() => setIsOpen(false)} className="flex items-center justify-between py-4 text-sm font-medium text-slate-200 transition hover:text-blue-400">
                Contact Us
                <ChevronRight size={17} className="text-slate-500" />
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
