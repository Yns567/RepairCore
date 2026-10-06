"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { updateCartItemQuantity, removeFromCart } from "@/app/cart/actions";
import { useT } from "@/lib/i18n/client";

type CartLineItemProps = {
  id: number;
  name: string;
  image: string | null;
  price: string;
  quantity: number;
};

export default function CartLineItem({
  id,
  name,
  image,
  price,
  quantity,
}: CartLineItemProps) {
  const { t } = useT();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function changeQuantity(next: number) {
    startTransition(async () => {
      const result = await updateCartItemQuantity(id, next);
      if (!result.success) setMessage(result.message);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeFromCart(id);
      if (!result.success) setMessage(result.message);
    });
  }

  return (
    <div
      className={`flex gap-3 rounded-xl border border-slate-800 bg-[#111827] p-3 sm:items-center sm:gap-4 sm:p-4 ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          sizes="80px"
          className="object-contain p-1.5"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p dir="auto" className="text-flow line-clamp-2 text-sm font-semibold text-white">{name}</p>
          <p className="mt-1 text-sm font-bold text-blue-400" dir="ltr">{price} MAD</p>
          {message && <p className="mt-1 text-xs text-rose-400">{message}</p>}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center rounded-lg border border-slate-700">
            <button
              onClick={() => changeQuantity(quantity - 1)}
              disabled={quantity <= 1 || isPending}
              aria-label={t("cart.decrease")}
              className="grid h-9 w-9 place-items-center text-white hover:bg-slate-800 disabled:text-slate-600"
            >
              <Minus size={15} />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-white">{quantity}</span>
            <button
              onClick={() => changeQuantity(quantity + 1)}
              disabled={isPending}
              aria-label={t("cart.increase")}
              className="grid h-9 w-9 place-items-center text-white hover:bg-slate-800 disabled:text-slate-600"
            >
              <Plus size={15} />
            </button>
          </div>

          <button
            onClick={remove}
            disabled={isPending}
            aria-label={t("cartPage.remove")}
            title={t("cartPage.remove")}
            className="grid h-9 w-9 place-items-center rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
