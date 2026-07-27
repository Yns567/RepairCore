"use client";

import { ShoppingCart } from "lucide-react";
import { useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";

type AddToCartButtonProps = {
  productId: number;
  quantity?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export default function AddToCartButton({
  productId,
  quantity = 1,
  disabled = false,
  fullWidth = false,
  className = "",
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleClick() {
    setMessage("");
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      setMessage(result.message);
    });
  }

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isPending}
        className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 ${className}`}
      >
        <ShoppingCart size={17} />
        {disabled ? "Out of Stock" : isPending ? "Adding…" : "Add to Cart"}
      </button>
      {message && (
        <p aria-live="polite" className={`mt-2 text-xs ${message.includes("added") ? "text-emerald-500" : "text-rose-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
