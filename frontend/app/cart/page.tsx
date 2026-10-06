import Link from "next/link";
import { getCart } from "@/lib/cart";
import { getT } from "@/lib/i18n/server";
import { sumLines } from "@/lib/money";
import CartLineItem from "@/components/cart/CartLineItem";

export default async function CartPage() {
  const [cart, { t }] = await Promise.all([getCart(), getT()]);
  const items = cart?.items ?? [];

  const total = sumLines(items.map((item) => ({ unitPrice: item.product.price, quantity: item.quantity })));

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-12 md:py-20 text-center">
        <h1 className="text-2xl font-bold md:text-3xl text-white">{t("cartPage.emptyTitle")}</h1>
        <p className="mt-4 text-slate-400">{t("cartPage.emptyText")}</p>
        <Link
          href="/store"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
        >
          {t("cartPage.browse")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 md:py-12">
      <h1 className="text-2xl font-bold md:text-4xl text-white">{t("cartPage.title")}</h1>

      <div className="mt-5 space-y-3 md:mt-8">
        {items.map((item) => (
          <CartLineItem
            key={item.id}
            id={item.id}
            name={item.product.name}
            image={item.product.image}
            price={item.product.price.toFixed(2)}
            quantity={item.quantity}
          />
        ))}
      </div>

      {/* Total and checkout stay reachable above the bottom navigation on phones. */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 -mx-4 mt-5 flex items-center gap-4 border-t border-slate-800 bg-[#070d18]/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:mt-8 md:rounded-2xl md:border md:bg-[#111827] md:p-6">
        <div className="min-w-0 flex-1">
          <span className="block text-xs text-slate-400 md:text-sm">{t("cartPage.total")}</span>
          <span className="block text-xl font-extrabold text-blue-400 md:text-2xl" dir="ltr">{total.toFixed(2)} MAD</span>
        </div>
        <Link
          href="/checkout"
          className="shrink-0 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-500 md:px-10"
        >
          {t("cartPage.checkout")}
        </Link>
      </div>
    </main>
  );
}
