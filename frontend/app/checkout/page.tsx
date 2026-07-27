import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import CheckoutForm from "@/components/cart/CheckoutForm";
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

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );
  const wallet = await getWallet(session.user.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Checkout</h1>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <p className="text-slate-300">
          Items: {items.reduce((n, i) => n + i.quantity, 0)}
        </p>
        <p className="mt-2 text-2xl font-bold text-blue-400">
          {total.toFixed(2)} $
        </p>
      </div>

      <div className="mt-8">
        <CheckoutForm
          defaultName={session.user.name ?? ""}
          total={total}
          walletBalance={Number(wallet.balance)}
          currency={wallet.currency}
        />
      </div>
    </main>
  );
}
