"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { updateCartItemQuantity, removeFromCart } from "@/app/cart/actions";

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
      className={`flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#111827] p-4 ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <div className="relative h-20 w-20 shrink-0 bg-[#0F172A]">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-contain p-2"
        />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-white">{name}</p>
        <p className="mt-1 text-blue-400">{price} $</p>
        {message && <p className="mt-1 text-xs text-rose-400">{message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => changeQuantity(quantity - 1)}
          disabled={quantity <= 1 || isPending}
          aria-label="Decrease quantity"
          className="h-8 w-8 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
        >
          −
        </button>
        <span className="w-6 text-center text-white">{quantity}</span>
        <button
          onClick={() => changeQuantity(quantity + 1)}
          disabled={isPending}
          aria-label="Increase quantity"
          className="h-8 w-8 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
        >
          +
        </button>
      </div>

      <button
        onClick={remove}
        disabled={isPending}
        className="ml-4 text-sm text-red-400 hover:text-red-300"
      >
        Remove
      </button>
    </div>
  );
}
