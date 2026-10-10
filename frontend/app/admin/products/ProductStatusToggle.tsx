"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleProductStatus } from "./actions";

/** One-tap Active/Inactive switch for the products table, no need to open Edit. */
export default function ProductStatusToggle({ id, status }: { id: number; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const active = status === "ACTIVE";

  function handleClick() {
    startTransition(async () => {
      const result = await toggleProductStatus(id);
      if (!result.ok) {
        alert(result.message ?? "Could not update the product status.");
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
      title={active ? "Click to deactivate (hide from the store)" : "Click to activate (show in the store)"}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-50 ${
        active
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} aria-hidden />
      {pending ? "…" : active ? "Active" : "Inactive"}
    </button>
  );
}
