import Link from "next/link";
import {
  ChevronDown,
  CircleUserRound,
  Grid2X2,
  Search,
  Heart,
  ShoppingCart,
  Menu,
  Wrench,
} from "lucide-react";
import { getCart, getCartItemCount } from "@/lib/cart";

export default async function Navbar() {
  const cart = await getCart();
  const cartItemCount = getCartItemCount(cart);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#070d18]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="RepairCore home">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-800 shadow-[0_0_20px_rgba(37,99,235,.35)]">
            <Wrench size={22} strokeWidth={2.4} />
          </span>
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-tight">REPAIRCORE</span>
            <span className="mt-1 block text-[9px] font-medium tracking-wide text-slate-400">Tools &amp; Electronics</span>
          </span>
        </Link>

        <div className="relative hidden flex-1 md:block">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-lg border border-slate-800 bg-[#121a27] py-2.5 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
          />
          <Search size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
        </div>

        <div className="ml-auto hidden items-center gap-5 text-sm md:flex">
          <button className="flex items-center gap-1.5 font-medium text-slate-200 hover:text-white">
            <span className="text-base">🇺🇸</span> USD <ChevronDown size={14} />
          </button>
          <Link href="/account" className="text-slate-300 transition hover:text-white" aria-label="Account">
            <CircleUserRound size={20} />
          </Link>
          <button className="text-slate-300 transition hover:text-white" aria-label="Wishlist">
            <Heart size={22} />
          </button>
          <Link href="/cart" className="relative text-slate-300 transition hover:text-white" aria-label="Cart">
            <ShoppingCart size={22} />
            <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
              {cartItemCount}
            </span>
          </Link>
        </div>

        <button className="ml-auto text-slate-300 md:hidden" aria-label="Open navigation">
          <Menu size={25} />
        </button>
      </div>

      <div className="hidden border-t border-slate-800 lg:block">
        <div className="mx-auto flex h-[49px] max-w-7xl items-center gap-7 px-6 text-[12px] font-medium text-slate-300">
          <Link href="/store" className="flex h-8 items-center gap-2 rounded-md bg-blue-600 px-4 text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500">
            <Grid2X2 size={15} /> All Categories <ChevronDown size={14} />
          </Link>
          <Link href="/software" className="transition hover:text-blue-400">Programmers</Link>
          <Link href="/software" className="transition hover:text-blue-400">Boxes</Link>
          <Link href="/hardware" className="transition hover:text-blue-400">Tools</Link>
          <Link href="/store" className="transition hover:text-blue-400">Spare Parts</Link>
          <Link href="/store" className="transition hover:text-blue-400">Accessories</Link>
          <Link href="/store" className="transition hover:text-blue-400">New Arrivals</Link>
          <Link href="/store" className="transition hover:text-blue-400">Brands</Link>
          <Link href="/account" className="transition hover:text-blue-400">Contact Us</Link>
        </div>
      </div>
    </header>
  );
}
