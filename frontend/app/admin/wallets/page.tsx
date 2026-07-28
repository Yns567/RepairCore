import { prisma } from "@/lib/prisma";
import { addWalletCredit } from "./actions";

export default async function AdminWalletsPage() {
  const [users, transactions] = await Promise.all([
    prisma.user.findMany({
      include: { wallet: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.walletTransaction.findMany({
      include: { wallet: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Customer balances</h1>
      <p className="mt-1 text-sm text-gray-500">Add store credit after receiving a manual payment. Every adjustment is recorded permanently.</p>

      {users.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">No customer accounts yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[60rem] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Add credit / refund</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-4"><p className="font-medium text-gray-900">{user.name || "Customer"}</p><p className="text-xs text-gray-500">{user.email}</p></td>
                  <td className="px-4 py-4 font-semibold text-gray-900">{user.wallet?.balance.toString() ?? "0.00"} {user.wallet?.currency ?? "USD"}</td>
                  <td className="px-4 py-3">
                    <form action={addWalletCredit} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <input name="amount" type="number" min="0.01" step="0.01" required placeholder="Amount" className="w-24 rounded border border-gray-300 bg-white px-2 py-1.5 text-gray-900 placeholder:text-gray-400" />
                      <select name="type" defaultValue="CREDIT" className="rounded border border-gray-300 bg-white px-2 py-1.5 text-gray-900">
                        <option value="CREDIT">Credit</option>
                        <option value="REFUND">Refund</option>
                        <option value="ADJUSTMENT">Adjustment</option>
                      </select>
                      <input name="description" required minLength={3} maxLength={200} placeholder="Reason / payment reference" className="w-56 rounded border border-gray-300 bg-white px-2 py-1.5 text-gray-900 placeholder:text-gray-400" />
                      <button className="rounded bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">Recent balance activity</h2>
        {transactions.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No balance activity yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Date</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{transaction.wallet.user.name || "Customer"}</p><p className="text-xs text-gray-500">{transaction.wallet.user.email}</p></td>
                    <td className="px-4 py-3 font-medium text-gray-700">{transaction.type}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{transaction.type === "DEBIT" ? "−" : "+"}{transaction.amount.toString()} USD</td>
                    <td className="px-4 py-3 text-gray-600">{transaction.description}</td>
                    <td className="px-4 py-3 text-gray-600">{transaction.createdAt.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
