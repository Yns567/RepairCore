"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ServiceOrderFormProps = {
  serviceId: number;
  slug: string;
  inputType: string;
  price: string;
};

export default function ServiceOrderForm({ serviceId, slug, inputType, price }: ServiceOrderFormProps) {
  const router = useRouter();
  const requestId = useRef<string | null>(null);
  const [imei, setImei] = useState("");
  const [accountUsername, setAccountUsername] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [notes, setNotes] = useState("");
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitOrder(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      requestId.current ??= crypto.randomUUID();
      const response = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          requestId: requestId.current,
          expectedPrice: price,
          imei,
          accountUsername,
          deviceModel,
          notes,
          authorizationConfirmed,
        }),
      });

      if (response.status === 401) {
        router.push(`/login?next=/services/${slug}`);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "We could not submit this order.");
        return;
      }

      router.push("/account/services");
      router.refresh();
    } catch {
      setError("Could not connect to the service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitOrder} className="space-y-4">
      {inputType === "IMEI" && (
        <label className="block text-sm font-medium text-slate-200">IMEI (15 digits)
          <input value={imei} onChange={(event) => setImei(event.target.value.replace(/\D/g, "").slice(0, 15))} inputMode="numeric" pattern="[0-9]{15}" required className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500" placeholder="Enter the device IMEI" />
        </label>
      )}
      {inputType === "USERNAME" && (
        <label className="block text-sm font-medium text-slate-200">Tool account username or email
          <input value={accountUsername} onChange={(event) => setAccountUsername(event.target.value)} required maxLength={120} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500" placeholder="Existing account username" />
        </label>
      )}
      <label className="block text-sm font-medium text-slate-200">Device model (optional)
        <input value={deviceModel} onChange={(event) => setDeviceModel(event.target.value)} maxLength={100} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500" placeholder="e.g. Samsung Galaxy S23" />
      </label>
      <label className="block text-sm font-medium text-slate-200">Order notes (optional)
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} rows={3} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500" placeholder="Add only details required to process this order" />
      </label>
      <label className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
        <input type="checkbox" checked={authorizationConfirmed} onChange={(event) => setAuthorizationConfirmed(event.target.checked)} required className="mt-1" />
        I confirm that I own this device/account or have explicit authorization to service it, and that it is not reported lost or stolen.
      </label>
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={loading || !authorizationConfirmed} className="w-full rounded-lg bg-blue-600 py-3.5 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700">{loading ? "Processing..." : `Pay $${price} from balance`}</button>
    </form>
  );
}
