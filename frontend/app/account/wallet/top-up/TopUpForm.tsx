"use client";

import { useActionState } from "react";
import { submitTopUp, type TopUpState } from "./actions";

const inputClass = "mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500";

export default function TopUpForm({ banks }: { banks: { value: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState<TopUpState, FormData>(submitTopUp, { status: "idle" });

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-emerald-200">
        <p className="font-semibold">{state.message}</p>
        <a href="/account/wallet" className="mt-3 inline-block text-sm font-medium text-emerald-300 underline">View my balance</a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-slate-800 bg-[#111827] p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-300">
          Amount transferred
          <input name="amount" inputMode="decimal" required pattern="\d{1,8}(\.\d{1,2})?" placeholder="500.00" className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Balance to credit
          <select name="currency" defaultValue="MAD" className={inputClass}>
            <option value="MAD">Dirham (MAD) — products, courses</option>
            <option value="USD">Dollar (USD) — GSM services, software</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Your bank
          <select name="bank" defaultValue="CIH" className={inputClass}>
            {banks.map((bank) => <option key={bank.value} value={bank.value}>{bank.label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Transfer reference (optional)
          <input name="reference" maxLength={120} className={inputClass} />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-300">
        Receipt (photo or PDF, max 3 MB)
        <input name="receipt" type="file" required accept="image/jpeg,image/png,image/webp,application/pdf" className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white`} />
      </label>
      {state.status === "error" && <p className="text-sm text-rose-400">{state.message}</p>}
      <button disabled={pending} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-700">
        {pending ? "Sending..." : "Send top-up request"}
      </button>
    </form>
  );
}
