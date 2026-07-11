"use client";

import { Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import AddToCartButton from "./AddToCartButton";

type ProductPurchaseProps = {
  productId: number;
  stock: number;
};

export default function ProductPurchase({ productId, stock }: ProductPurchaseProps) {
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
          aria-label="Decrease quantity"
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
          aria-label="Increase quantity"
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

      <button
        type="button"
        className="grid h-12 w-12 place-items-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
        aria-label="Add to wishlist"
      >
        <Heart size={19} />
      </button>
    </div>
  );
}
