"use client";

import { ShoppingCart } from "lucide-react";
import { useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";

type AddToCartButtonProps = {
  productId: number;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
};

export default function AddToCartButton({
  productId,
  quantity = 1,
  disabled = false,
  className = "",
  fullWidth = false,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleAddToCart() {
    setMessage("");
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      setMessage(result.message);
    });
  }

  const isDisabled = disabled || isPending;

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 ${fullWidth ? "w-full" : ""} ${className}`}
      >
        <ShoppingCart size={18} />
        {isPending ? "Adding…" : disabled ? "Out of Stock" : "Add to Cart"}
      </button>
      <p
        aria-live="polite"
        className={`mt-2 text-xs ${message.includes("added") || message === "Cart updated." ? "text-emerald-400" : "text-rose-400"}`}
      >
        {message}
      </p>
    </div>
  );
}
