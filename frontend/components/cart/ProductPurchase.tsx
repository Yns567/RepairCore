"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n/client";
import AddToCartButton from "./AddToCartButton";

type ProductPurchaseProps = {
  productId: number;
  stock: number;
};

export default function ProductPurchase({ productId, stock }: ProductPurchaseProps) {
  const { t } = useT();
  const [quantity, setQuantity] = useState(1);
  const outOfStock = stock < 1;

  return (
    <div className="mt-6 flex gap-3">
      <div className="flex h-12 shrink-0 items-center rounded-lg border border-slate-700 bg-[#121a27]">
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          disabled={outOfStock || quantity === 1}
          className="grid h-full w-11 place-items-center text-slate-300 transition hover:text-blue-400 disabled:cursor-not-allowed disabled:text-slate-600"
          aria-label={t("cart.decrease")}
        >
          <Minus size={17} />
        </button>
        <span className="grid h-full min-w-10 place-items-center border-x border-slate-700 px-2 text-sm font-bold text-white">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.min(stock, current + 1))}
          disabled={outOfStock || quantity >= stock}
          className="grid h-full w-11 place-items-center text-slate-300 transition hover:text-blue-400 disabled:cursor-not-allowed disabled:text-slate-600"
          aria-label={t("cart.increase")}
        >
          <Plus size={17} />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <AddToCartButton
          productId={productId}
          quantity={quantity}
          disabled={outOfStock}
          fullWidth
          className="h-12"
        />
      </div>
    </div>
  );
}
