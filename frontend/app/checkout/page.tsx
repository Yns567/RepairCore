import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import CheckoutForm from "@/components/cart/CheckoutForm";
import { formatMoney, PRICING_CURRENCY, sumLines } from "@/lib/money";
import { getT } from "@/lib/i18n/server";
import { getWallet } from "@/lib/wallet";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?next=/checkout");
  }

  const cart = await getCart();
  const items = cart?.items ?? [];

  if (items.length === 0) {
    redirect("/cart");
  }

  const total = sumLines(items.map((item) => ({ unitPrice: item.product.price, quantity: item.quantity })));
  const [wallet, { t }] = await Promise.all([getWallet(session.user.id, PRICING_CURRENCY.store), getT()]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">{t("checkout.title")}</h1>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <p className="text-slate-300">
          {t("checkout.items", { count: items.reduce((n, i) => n + i.quantity, 0) })}
        </p>
        <p className="mt-2 text-2xl font-bold text-blue-400" dir="ltr">
          {formatMoney(total, PRICING_CURRENCY.store)}
        </p>
      </div>

      <div className="mt-8">
        <CheckoutForm
          defaultName={session.user.name ?? ""}
          walletBalance={wallet.balance.toFixed(2)}
          canPayWithBalance={wallet.balance.gte(total)}
          currency={wallet.currency}
        />
      </div>
    </main>
  );
}
