import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { reviewTopUp } from "./actions";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

export default async function AdminTopUpsPage() {
  const requests = await prisma.topUpRequest.findMany({
    select: {
      id: true, currency: true, amount: true, creditedAmount: true, bank: true, reference: true,
      receiptType: true, status: true, adminNote: true, createdAt: true, reviewedAt: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
  const pending = requests.filter((request) => request.status === "PENDING");
  const reviewed = requests.filter((request) => request.status !== "PENDING");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Top-up requests</h1>
      <p className="mt-1 text-sm text-gray-500">
        Check the receipt against your bank account before approving. Approval credits the customer immediately.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Waiting for review ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No pending requests.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {pending.map((request) => (
            <div key={request.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">#{request.id} · {request.user.name || "Customer"} · {request.user.email}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Declared {formatMoney(request.amount, request.currency)} to {request.currency} balance · {request.bank}
                    {request.reference ? ` · Ref: ${request.reference}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{request.createdAt.toLocaleString("en-US")}</p>
                </div>
                <a href={`/admin/top-ups/${request.id}/receipt`} target="_blank" rel="noopener" className="rounded border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50">
                  View receipt ({request.receiptType === "application/pdf" ? "PDF" : "image"})
                </a>
              </div>
              <form action={reviewTopUp} className="mt-4 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={request.id} />
                <label className="text-sm text-gray-700">
                  Credit
                  <input name="creditedAmount" defaultValue={request.amount.toFixed(2)} inputMode="decimal" className="ml-2 w-28 rounded border border-gray-300 px-2 py-1.5 text-gray-900" />
                  <span className="ml-1">{request.currency}</span>
                </label>
                <input name="adminNote" maxLength={300} placeholder="Note to customer (optional)" className="w-64 rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900" />
                <button name="decision" value="APPROVE" className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">Approve</button>
                <button name="decision" value="REJECT" className="rounded bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700">Reject</button>
              </form>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold text-gray-900">Reviewed</h2>
      {reviewed.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Nothing reviewed yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Declared</th><th className="px-4 py-3">Credited</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Receipt</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {reviewed.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-3">{request.id}</td>
                  <td className="px-4 py-3">{request.user.email}</td>
                  <td className="px-4 py-3">{formatMoney(request.amount, request.currency)}</td>
                  <td className="px-4 py-3">{request.creditedAmount ? formatMoney(request.creditedAmount, request.currency) : "—"}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[request.status] ?? ""}`}>{request.status}</span></td>
                  <td className="px-4 py-3"><a href={`/admin/top-ups/${request.id}/receipt`} target="_blank" rel="noopener" className="text-blue-700 underline">Open</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
