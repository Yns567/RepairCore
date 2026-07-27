import Link from "next/link";
import { getCart } from "@/lib/cart";
import CartLineItem from "@/components/cart/CartLineItem";

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-white">Your cart is empty</h1>
        <p className="mt-4 text-slate-400">
          You haven&apos;t added any products yet.
        </p>
        <Link
          href="/store"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
        >
          Browse the Store
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold text-white">Shopping Cart</h1>

      <div className="mt-10 space-y-4">
        {items.map((item) => (
          <CartLineItem
            key={item.id}
            id={item.id}
            name={item.product.name}
            image={item.product.image}
            price={item.product.price.toString()}
            quantity={item.quantity}
          />
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <span className="text-lg text-slate-300">Total</span>
        <span className="text-2xl font-bold text-blue-400">
          {total.toFixed(2)} $
        </span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-500"
      >
        Checkout
      </Link>
    </main>
  );
}
