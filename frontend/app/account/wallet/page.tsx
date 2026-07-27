import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWallet } from "@/lib/wallet";

const typeLabels: Record<string, string> = {
  CREDIT: "Credit added",
  DEBIT: "Payment",
  REFUND: "Refund",
  ADJUSTMENT: "Balance adjustment",
};

export default async function WalletPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?next=/account/wallet");

  const wallet = await getWallet(userId);
  const transactions = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/account" className="text-sm font-medium text-blue-400 hover:text-blue-300">← Back to account</Link>
      <h1 className="mt-4 text-3xl font-bold text-white">Store balance</h1>
      <div className="mt-6 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600 to-blue-800 p-7 shadow-xl shadow-blue-950/30">
        <p className="text-sm font-medium text-blue-100">Available balance</p>
        <p className="mt-2 text-4xl font-extrabold text-white">{wallet.balance.toString()} {wallet.currency}</p>
        <p className="mt-3 max-w-xl text-sm text-blue-100">
          Your balance can pay for products, software plans, IMEI checks, tool
          credits, and rentals.{" "}
          <Link href="/contact" className="font-semibold underline underline-offset-2">
            Contact support
          </Link>{" "}
          after a manual payment so we can add your credit.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-white">Balance history</h2>
        {transactions.length === 0 ? (
          <p className="mt-4 text-slate-400">No balance transactions yet.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 border-b border-slate-800 p-4 last:border-0">
                <div><p className="font-medium text-white">{typeLabels[transaction.type] ?? transaction.type}</p><p className="mt-1 text-sm text-slate-400">{transaction.description}</p><p className="mt-1 text-xs text-slate-500">{transaction.createdAt.toLocaleString("en-US")}</p></div>
                <div className="text-right"><p className={transaction.type === "DEBIT" ? "font-bold text-red-400" : "font-bold text-emerald-400"}>{transaction.type === "DEBIT" ? "−" : "+"}{transaction.amount.toString()} {wallet.currency}</p><p className="mt-1 text-xs text-slate-500">Balance: {transaction.balanceAfter.toString()}</p></div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
