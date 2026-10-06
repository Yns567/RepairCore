import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBankAccounts, TOP_UP_BANKS } from "@/lib/top-up";
import TopUpForm from "./TopUpForm";

export default async function TopUpPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/account/wallet/top-up");

  const accounts = getBankAccounts();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/account/wallet" className="text-sm font-medium text-blue-400 hover:text-blue-300">← Back to balance</Link>
      <h1 className="mt-4 text-3xl font-bold text-white">Top up balance</h1>
      <p className="mt-2 text-slate-400">
        1. Transfer the amount to one of our accounts. 2. Upload the receipt below. 3. We credit your balance after checking it.
      </p>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <h2 className="text-lg font-semibold text-white">Our bank accounts</h2>
        {accounts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Bank details are not published yet. <Link href="/contact" className="text-blue-400 underline">Contact us</Link> to receive them.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {accounts.map((account) => (
              <li key={account.rib} className="rounded-lg border border-slate-700 p-4">
                <p className="font-semibold text-white">{account.bank}</p>
                <p className="mt-1 text-sm text-slate-400">Holder: {account.holder}</p>
                <p className="mt-1 font-mono text-sm text-blue-300 select-all">RIB: {account.rib}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Dollar balance: transfer the dirham equivalent and choose USD. The credited dollar amount is confirmed by our team.
        </p>
      </section>

      <div className="mt-8">
        <TopUpForm banks={Object.entries(TOP_UP_BANKS).map(([value, label]) => ({ value, label }))} />
      </div>
    </main>
  );
}
