"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, House, ShieldCheck, ShoppingBag, ShoppingCart } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";

const items: { href: string; label: MessageKey; icon: typeof House; match: (path: string) => boolean }[] = [
  { href: "/", label: "nav.homeShort", icon: House, match: (path) => path === "/" },
  { href: "/store", label: "nav.storeShort", icon: ShoppingBag, match: (path) => /^\/(store|hardware|products|brands|software)/.test(path) },
  { href: "/services", label: "nav.services", icon: ShieldCheck, match: (path) => path.startsWith("/services") },
  { href: "/cart", label: "nav.cart", icon: ShoppingCart, match: (path) => path.startsWith("/cart") || path.startsWith("/checkout") },
  { href: "/account", label: "nav.account", icon: CircleUserRound, match: (path) => /^\/(account|orders|login|register)/.test(path) },
];

/** App-style navigation for phones; hidden from md up, where the header shows everything. */
export default function BottomNav({ cartItemCount }: { cartItemCount: number }) {
  const { t } = useT();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label={t("nav.mobile")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-[#070d18]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${active ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
              >
                {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-blue-500" aria-hidden />}
                <span className="relative">
                  <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                  {href === "/cart" && cartItemCount > 0 && (
                    <span className="absolute -end-2.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                      {cartItemCount}
                    </span>
                  )}
                </span>
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
