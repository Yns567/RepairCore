"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LegalNotice from "@/components/legal/LegalNotice";
import { useT } from "@/lib/i18n/client";

export default function CheckoutForm({
  defaultName,
  walletBalance,
  canPayWithBalance,
  currency,
}: {
  defaultName: string;
  walletBalance: string;
  canPayWithBalance: boolean;
  currency: string;
}) {
  const { t } = useT();
  const router = useRouter();
  const [fullName, setFullName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BALANCE">("COD");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, address, city, notes, paymentMethod }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? t("checkout.failed"));
        return;
      }

      router.push(`/orders/${data.order.id}`);
    } catch {
      setError(t("checkout.offline"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder={t("checkout.fullName")}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        className="w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500"
      />
      <input
        type="tel"
        placeholder={t("checkout.phone")}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        className="w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500"
      />
      <input
        type="text"
        placeholder={t("checkout.city")}
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
        className="w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500"
      />
      <textarea
        placeholder={t("checkout.address")}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        rows={3}
        className="w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500"
      />

      <fieldset className="rounded-xl border border-slate-800 bg-[#111827] p-4">
        <legend className="px-1 text-sm font-semibold text-white">{t("checkout.payment")}</legend>
        <label className="mt-2 flex cursor-pointer items-center gap-3 text-sm text-slate-200">
          <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
          {t("checkout.cod")}
        </label>
        <label className={`mt-3 flex items-center gap-3 text-sm ${canPayWithBalance ? "cursor-pointer text-slate-200" : "cursor-not-allowed text-slate-500"}`}>
          <input type="radio" name="paymentMethod" value="BALANCE" checked={paymentMethod === "BALANCE"} onChange={() => setPaymentMethod("BALANCE")} disabled={!canPayWithBalance} />
          {t("checkout.balance", { balance: walletBalance, currency })}
        </label>
        {!canPayWithBalance && <p className="mt-3 text-xs text-amber-400">{t("checkout.lowBalance")} <Link href="/account/wallet/top-up" className="underline">{t("checkout.topUp")}</Link></p>}
      </fieldset>
      <textarea
        placeholder={t("checkout.notes")}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500"
      />

      <LegalNotice />
      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading || (paymentMethod === "BALANCE" && !canPayWithBalance)}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-700"
      >
        {loading ? t("checkout.confirming") : paymentMethod === "BALANCE" ? t("checkout.payBalance") : t("checkout.confirmCod")}
      </button>
    </form>
  );
}
