import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { removeCartItem, updateCartItemQuantity } from "./actions";
import { getCart, getCartItemCount } from "@/lib/cart";

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];
  const itemCount = getCartItemCount(cart);
  const subtotal = items.reduce(
    (total, item) => total + Number(item.product.price.toString()) * item.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-[#070d18] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-sm font-semibold text-blue-400">YOUR ORDER</p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Shopping Cart</h1>
          </div>
          <Link href="/store" className="text-sm font-semibold text-blue-400 transition hover:text-blue-300">
            ← Continue shopping
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-[#111827] px-6 py-16 text-center">
                <ShoppingCartEmpty />
              </div>
            ) : (
              items.map((item) => {
                const decrease = updateCartItemQuantity.bind(null, item.id, item.quantity - 1);
                const increase = updateCartItemQuantity.bind(null, item.id, item.quantity + 1);
                const remove = removeCartItem.bind(null, item.id);
                const unavailable = item.product.stock < 1 || item.product.status !== "ACTIVE";

                return (
                  <article key={item.id} className="flex gap-4 rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:gap-6 sm:p-5">
                    <Link href={`/products/${item.product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#0b1220] sm:h-28 sm:w-28">
                      <Image
                        src={item.product.image || "/placeholder.png"}
                        alt={item.product.name}
                        fill
                        className="object-contain p-2"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-xs font-semibold text-blue-400">{item.product.category || "Tools"}</p>
                          <Link href={`/products/${item.product.slug}`} className="line-clamp-2 text-base font-bold text-white transition hover:text-blue-400 sm:text-lg">
                            {item.product.name}
                          </Link>
                        </div>
                        <form action={remove}>
                          <button type="submit" className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400" aria-label={`Remove ${item.product.name}`}>
                            <Trash2 size={18} />
                          </button>
                        </form>
                      </div>

                      {unavailable ? (
                        <p className="mt-2 text-xs font-semibold text-rose-400">This item is currently unavailable.</p>
                      ) : (
                        <p className="mt-2 text-xs text-emerald-400">In stock · {item.product.stock} available</p>
                      )}

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex items-center rounded-lg border border-slate-700 bg-[#0b1220]">
                          <form action={decrease}>
                            <button type="submit" disabled={item.quantity <= 1} className="grid h-9 w-9 place-items-center text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:text-slate-700" aria-label="Decrease quantity">
                              <Minus size={16} />
                            </button>
                          </form>
                          <span className="grid h-9 min-w-9 place-items-center border-x border-slate-700 px-2 text-sm font-bold text-white">{item.quantity}</span>
                          <form action={increase}>
                            <button type="submit" disabled={unavailable || item.quantity >= item.product.stock} className="grid h-9 w-9 place-items-center text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:text-slate-700" aria-label="Increase quantity">
                              <Plus size={16} />
                            </button>
                          </form>
                        </div>
                        <p className="shrink-0 text-lg font-bold text-white">${(Number(item.product.price.toString()) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>

          <aside className="h-fit rounded-2xl border border-slate-800 bg-[#111827] p-6">
            <h2 className="text-xl font-bold text-white">Order Summary</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between text-slate-300"><span>Items ({itemCount})</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-slate-300"><span>Shipping</span><span className="text-emerald-400">Calculated at checkout</span></div>
              <div className="border-t border-slate-700 pt-4 text-lg font-bold text-white"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div></div>
            </div>
            <button disabled={items.length === 0} className="mt-7 w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700">
              Proceed to Checkout
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-slate-500">Secure checkout will be added in the next commerce step.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ShoppingCartEmpty() {
  return (
    <>
      <p className="text-lg font-bold text-white">Your cart is empty</p>
      <p className="mt-2 text-sm text-slate-400">Discover professional repair tools and add the products you need.</p>
      <Link href="/store" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500">Browse products</Link>
    </>
  );
}
