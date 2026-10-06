"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";
import { useT } from "@/lib/i18n/client";

type AddToCartButtonProps = {
  productId: number;
  quantity?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
  className?: string;
};

export default function AddToCartButton({
  productId,
  quantity = 1,
  disabled = false,
  fullWidth = false,
  compact = false,
  className = "",
}: AddToCartButtonProps) {
  const { t } = useT();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [added]);

  function handleClick() {
    setError("");
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      // Success is shown on the button itself so compact cards keep their size.
      if (result.success) setAdded(true);
      else setError(result.message);
    });
  }

  const label = disabled ? t("stock.out") : isPending ? t("cart.adding") : added ? t("cart.added") : t("cart.add");

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isPending}
        className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 ${
          added ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"
        } ${compact ? "px-2 py-2 text-xs" : "px-4 py-2 text-sm"} ${className}`}
      >
        {added ? <Check size={compact ? 15 : 17} /> : <ShoppingCart size={compact ? 15 : 17} />}
        {label}
      </button>
      {error && (
        <p aria-live="polite" className={`mt-1.5 text-rose-400 ${compact ? "line-clamp-2 text-[11px]" : "text-xs"}`}>
          {error}
        </p>
      )}
    </div>
  );
}
