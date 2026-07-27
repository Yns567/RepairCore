"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SubscribeButton({ planId }: { planId: number }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (res.status === 401) {
        router.push("/login?next=/software");
        return;
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong, please try again.");
        return;
      }

      router.push("/account/subscriptions");
    });
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        {isPending ? "Processing payment..." : "Pay with store balance"}
      </button>
      <p className="mt-2 text-xs text-slate-500">Your balance is charged now; activation is completed by our team after review.</p>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
