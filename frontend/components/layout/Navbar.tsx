import Link from "next/link";
import {
  ChevronDown,
  CircleUserRound,
  Grid2X2,
  Search,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { getCart, getCartItemCount } from "@/lib/cart";
import { getT } from "@/lib/i18n/server";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileNav from "./MobileNav";

export default async function Navbar() {
  const [cart, { t }] = await Promise.all([getCart(), getT()]);
  const cartItemCount = getCartItemCount(cart);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#070d18]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={t("nav.home")}>
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-800 shadow-[0_0_20px_rgba(37,99,235,.35)]">
            <Wrench size={22} strokeWidth={2.4} />
          </span>
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-tight">REPAIRCORE</span>
            <span className="mt-1 block text-[9px] font-medium tracking-wide text-slate-400">{t("brand.tagline")}</span>
          </span>
        </Link>

        <form action="/store" className="relative hidden flex-1 md:block">
          <input
            type="text"
            name="search"
            placeholder={t("nav.search")}
            className="w-full rounded-lg border border-slate-800 bg-[#121a27] py-2.5 ps-4 pe-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
          />
          <button type="submit" className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white" aria-label={t("nav.search")}>
            <Search size={17} />
          </button>
        </form>

        <div className="ms-auto hidden items-center gap-5 text-sm md:flex">
          <LanguageSwitcher />
          <Link href="/account" className="text-slate-300 transition hover:text-white" aria-label={t("nav.account")}>
            <CircleUserRound size={20} />
          </Link>
          <Link href="/cart" className="relative text-slate-300 transition hover:text-white" aria-label={t("nav.cart")}>
            <ShoppingCart size={22} />
            <span className="absolute -end-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
              {cartItemCount}
            </span>
          </Link>
        </div>

        <MobileNav cartItemCount={cartItemCount} />
      </div>

      <div className="hidden border-t border-slate-800 lg:block">
        <div className="mx-auto flex h-[49px] max-w-7xl items-center gap-4 px-6 text-[11px] font-medium text-slate-300 xl:text-[12px]">
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
          <Link href="/contact" className="transition hover:text-blue-400">{t("nav.contact")}</Link>
        </div>
      </div>
    </header>
  );
}
