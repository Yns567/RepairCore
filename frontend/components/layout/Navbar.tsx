import Link from "next/link";
import {
  ChevronDown,
  CircleUserRound,
  Grid2X2,
  MessageCircle,
  Search,
  ShoppingCart,
  Truck,
  Wallet,
  Wrench,
} from "lucide-react";
import { auth } from "@/auth";
import { getCart, getCartItemCount } from "@/lib/cart";
import { getT } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { SITE, whatsappLink } from "@/lib/site";
import BottomNav from "./BottomNav";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileNav from "./MobileNav";

export default async function Navbar() {
  const [cart, { t }, session] = await Promise.all([getCart(), getT(), auth()]);
  const cartItemCount = getCartItemCount(cart);
  const userId = session?.user?.id;
  // Read-only lookup: wallets are created lazily elsewhere, never on every page view.
  const wallets = userId
    ? await prisma.wallet.findMany({ where: { userId }, orderBy: { currency: "desc" }, select: { currency: true, balance: true } })
    : [];

  return (
    <>
      {/* Utility bar, as on most GSM shops: contact, delivery, language and balance. */}
      <div className="border-b border-slate-800/80 bg-[#04080f] text-[11px] text-slate-400 sm:text-xs">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1.5 font-medium text-emerald-400 hover:text-emerald-300">
              <MessageCircle size={14} />
              <span dir="ltr">{SITE.phone}</span>
            </a>
            <span className="hidden items-center gap-1.5 truncate md:flex">
              <Truck size={14} className="shrink-0 text-blue-400" /> {t("top.delivery")}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <LanguageSwitcher size="sm" />
            {userId ? (
              <Link href="/account/wallet" className="flex items-center gap-1.5 rounded-md bg-slate-800/70 px-2 py-1 font-semibold text-white hover:bg-slate-700" title={t("top.balance")}>
                <Wallet size={13} className="text-blue-400" />
                <span dir="ltr" className="whitespace-nowrap">
                  {wallets.length === 0 ? "0.00" : wallets.map((wallet) => formatMoney(wallet.balance, wallet.currency)).join(" · ")}
                </span>
              </Link>
            ) : (
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Link href="/login" className="font-semibold text-white hover:text-blue-300">{t("auth.signIn")}</Link>
                <span className="text-slate-600">|</span>
                <Link href="/register" className="hover:text-white">{t("top.register")}</Link>
              </span>
            )}
          </div>
        </div>
      </div>

      <header className="z-50 border-b border-slate-800 bg-[#070d18]/95 text-white backdrop-blur-xl md:sticky md:top-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 md:h-[70px] md:gap-6">
          <MobileNav />

          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={t("nav.home")}>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-800 shadow-[0_0_20px_rgba(37,99,235,.35)] md:h-10 md:w-10">
              <Wrench size={20} strokeWidth={2.4} />
            </span>
            <span className="leading-none">
              <span className="block text-base font-extrabold tracking-tight md:text-lg">REPAIRCORE</span>
              <span className="mt-1 hidden text-[9px] font-medium tracking-wide text-slate-400 sm:block">{t("brand.tagline")}</span>
            </span>
          </Link>

          <SearchForm placeholder={t("nav.search")} className="hidden flex-1 md:block" />

          <div className="ms-auto flex items-center gap-1 md:gap-2">
            <Link href="/account" className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white md:flex">
              <CircleUserRound size={20} />
              <span className="hidden lg:inline">{t("nav.account")}</span>
            </Link>
            <Link href="/cart" className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white" aria-label={t("nav.cart")}>
              <ShoppingCart size={22} />
              <span className="hidden lg:inline">{t("nav.cart")}</span>
              {cartItemCount > 0 && (
                <span className="absolute end-1 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="px-4 pb-3 md:hidden">
          <SearchForm placeholder={t("nav.search")} />
        </div>

        <div className="hidden border-t border-slate-800 lg:block">
          <nav className="mx-auto flex h-[49px] max-w-7xl items-center gap-4 px-6 text-[11px] font-medium text-slate-300 xl:text-[12px]">
            <Link href="/store" className="flex h-8 items-center gap-2 rounded-md bg-blue-600 px-4 text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500">
              <Grid2X2 size={15} /> {t("nav.allCategories")} <ChevronDown size={14} />
            </Link>
            <Link href="/store?category=programmers" className="transition hover:text-blue-400">{t("nav.programmers")}</Link>
            <Link href="/store?category=boxes" className="transition hover:text-blue-400">{t("nav.boxes")}</Link>
            <Link href="/store?category=tools" className="transition hover:text-blue-400">{t("nav.tools")}</Link>
            <Link href="/store?category=spare-parts" className="transition hover:text-blue-400">{t("nav.spareParts")}</Link>
            <Link href="/store?category=accessories" className="transition hover:text-blue-400">{t("nav.accessories")}</Link>
            <span className="h-5 w-px bg-slate-700" aria-hidden />
            <Link href="/services?category=IMEI" className="font-semibold text-blue-300 transition hover:text-blue-200">{t("nav.imeiServices")}</Link>
            <Link href="/services?category=SERVER_CREDIT" className="font-semibold text-blue-300 transition hover:text-blue-200">{t("nav.credits")}</Link>
            <Link href="/services?category=TOOL_RENTAL" className="font-semibold text-blue-300 transition hover:text-blue-200">{t("nav.toolRent")}</Link>
            <Link href="/software" className="transition hover:text-blue-400">{t("cat.software")}</Link>
            <Link href="/contact" className="ms-auto transition hover:text-blue-400">{t("nav.contact")}</Link>
          </nav>
        </div>
      </header>

      <BottomNav cartItemCount={cartItemCount} />
    </>
  );
}

function SearchForm({ placeholder, className = "" }: { placeholder: string; className?: string }) {
  return (
    <form action="/store" role="search" className={`relative ${className}`}>
      <input
        type="search"
        name="search"
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-slate-700 bg-[#121a27] py-2.5 ps-4 pe-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
      />
      <button type="submit" className="absolute end-1 top-1/2 grid h-8 w-9 -translate-y-1/2 place-items-center rounded-md bg-blue-600 text-white hover:bg-blue-500" aria-label={placeholder}>
        <Search size={16} />
      </button>
    </form>
  );
}
