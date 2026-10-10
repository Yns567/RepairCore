"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Wallet } from "lucide-react";
import LegalNotice from "@/components/legal/LegalNotice";
import { useT } from "@/lib/i18n/client";

export default function CheckoutForm({
  defaultName,
  walletBalance,
  canPayWithBalance,
  currency,
  digitalOnly = false,
}: {
  defaultName: string;
  walletBalance: string;
  canPayWithBalance: boolean;
  currency: string;
  digitalOnly?: boolean;
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

    // Digital orders carry no delivery details and are always paid from balance.
    const body = digitalOnly
      ? { notes }
      : { fullName, phone, address, city, notes, paymentMethod };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // Not enough balance: send the customer straight to top-up.
        if (res.status === 402 || data?.topUp) {
          router.push("/account/wallet/top-up");
          return;
        }
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

  // ---- Digital-only checkout: no address, balance only ----
  if (digitalOnly) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-100">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-blue-300" />
          <p>{t("checkout.digitalNote")}</p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#111827] p-4 text-sm">
          <span className="flex items-center gap-2 text-slate-300"><Wallet size={16} className="text-blue-400" /> {t("account.balance")}</span>
          <span dir="ltr" className="font-bold text-white">{walletBalance} {currency}</span>
        </div>

        <textarea
          placeholder={t("checkout.notes")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500"
        />

        <LegalNotice />
        {error && <p className="text-sm text-red-400">{error}</p>}

        {canPayWithBalance ? (
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-700"
          >
            {loading ? t("checkout.confirming") : t("checkout.payBalance")}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-amber-400">{t("checkout.lowBalance")}</p>
            <Link
              href="/account/wallet/top-up"
              className="block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-500"
            >
              {t("checkout.topUpCta")}
            </Link>
          </div>
        )}
      </form>
    );
  }

  // ---- Physical / mixed checkout: full delivery form ----
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
