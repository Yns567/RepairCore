import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getWallets } from "@/lib/wallet";

const topUpStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300",
  APPROVED: "bg-emerald-500/15 text-emerald-300",
  REJECTED: "bg-rose-500/15 text-rose-300",
};

export default async function WalletPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?next=/account/wallet");

  const [wallets, { t, tKey, formatDate }] = await Promise.all([getWallets(userId), getT()]);
  const [transactions, topUps] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { walletId: { in: wallets.map((wallet) => wallet.id) } },
      include: { wallet: { select: { currency: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.topUpRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 md:py-12">
      <Link href="/account" className="text-sm font-medium text-blue-400 hover:text-blue-300">{t("wallet.back")}</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold md:text-3xl text-white">{t("wallet.title")}</h1>
        <Link href="/account/wallet/top-up" className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-500">
          {t("wallet.topUp")}
        </Link>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600 to-blue-800 p-7 shadow-xl shadow-blue-950/30">
            <p className="text-sm font-medium text-blue-100">{wallet.currency === "MAD" ? t("wallet.mad") : t("wallet.usd")}</p>
            <p className="mt-2 text-4xl font-extrabold text-white">{formatMoney(wallet.balance, wallet.currency)}</p>
            <p className="mt-3 text-sm text-blue-100">
              {wallet.currency === "MAD" ? t("wallet.madText") : t("wallet.usdText")}
            </p>
          </div>
        ))}
      </div>

      {topUps.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">{t("wallet.requests")}</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
            {topUps.map((topUp) => (
              <div key={topUp.id} className="flex items-center justify-between gap-4 border-b border-slate-800 p-4 last:border-0">
                <div>
                  <p className="font-medium text-white">#{topUp.id} · {topUp.bank} · {formatMoney(topUp.amount, topUp.currency)}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(topUp.createdAt)}</p>
                  {topUp.adminNote && <p className="mt-1 text-sm text-slate-400">{topUp.adminNote}</p>}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${topUpStatusStyles[topUp.status] ?? ""}`}>{tKey(`status.${topUp.status}`, topUp.status)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-bold text-white">{t("wallet.history")}</h2>
        {transactions.length === 0 ? (
          <p className="mt-4 text-slate-400">{t("wallet.empty")}</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 border-b border-slate-800 p-4 last:border-0">
                <div><p className="font-medium text-white">{tKey(`tx.${transaction.type}`, transaction.type)}</p><p className="mt-1 text-sm text-slate-400">{transaction.description}</p><p className="mt-1 text-xs text-slate-500">{formatDate(transaction.createdAt)}</p></div>
                <div className="text-right"><p className={transaction.type === "DEBIT" ? "font-bold text-red-400" : "font-bold text-emerald-400"}>{transaction.type === "DEBIT" ? "−" : "+"}{formatMoney(transaction.amount, transaction.wallet.currency)}</p><p className="mt-1 text-xs text-slate-500">{t("wallet.balanceAfter", { amount: formatMoney(transaction.balanceAfter, transaction.wallet.currency) })}</p></div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
