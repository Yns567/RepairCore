"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "./actions";

export default function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (!result.ok) {
        alert(result.message ?? "Could not delete this product.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1 font-medium text-rose-600 hover:underline disabled:opacity-50"
    >
      <Trash2 size={15} />
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
