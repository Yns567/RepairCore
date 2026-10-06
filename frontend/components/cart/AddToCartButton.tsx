"use client";

import { ShoppingCart } from "lucide-react";
import { useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";
import { useT } from "@/lib/i18n/client";

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
  const { t } = useT();
  const [message, setMessage] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  function handleClick() {
    setMessage("");
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      setSucceeded(result.success);
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
        {disabled ? t("stock.out") : isPending ? t("cart.adding") : t("cart.add")}
      </button>
      {message && (
        <p aria-live="polite" className={`mt-2 text-xs ${succeeded ? "text-emerald-500" : "text-rose-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
