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
    <div className="mt-7 flex flex-wrap gap-3">
      <div className="flex h-12 items-center rounded-lg border border-slate-300 bg-white">
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          disabled={outOfStock || quantity === 1}
          className="grid h-full w-11 place-items-center text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          aria-label={t("cart.decrease")}
        >
          <Minus size={17} />
        </button>
        <span className="grid h-full min-w-10 place-items-center border-x border-slate-200 px-2 text-sm font-bold text-slate-900">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.min(stock, current + 1))}
          disabled={outOfStock || quantity >= stock}
          className="grid h-full w-11 place-items-center text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          aria-label={t("cart.increase")}
        >
          <Plus size={17} />
        </button>
      </div>

      <AddToCartButton
        productId={productId}
        quantity={quantity}
        disabled={outOfStock}
        className="h-12 rounded-lg px-7"
      />
    </div>
  );
}
