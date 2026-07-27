import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { decryptSensitiveValue } from "@/lib/sensitive-data";
import { updateGsmServiceOrder } from "./actions";

const statuses = ["PENDING", "PROCESSING", "COMPLETED", "REJECTED", "CANCELLED"] as const;
const refundableStatuses = new Set(["REJECTED", "CANCELLED"]);

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-200 text-slate-700",
};

function readImei(value: string | null) {
  if (!value) return null;

  try {
    return decryptSensitiveValue(value);
  } catch {
    return "Encrypted value unavailable";
  }
}

export default async function AdminGsmServiceOrdersPage() {
  await requireAdmin();

  const orders = await prisma.gsmServiceOrder.findMany({
    include: {
      user: { select: { name: true, email: true } },
      service: { select: { name: true, category: true, provider: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">GSM service orders</h1>
      <p className="mt-1 text-sm text-gray-500">
        Process service requests and publish the result. Rejected or cancelled requests are refunded to the customer balance once.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No GSM service orders yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const imei = readImei(order.imei);
            const allowedStatuses = order.refundedAt
              ? statuses.filter((status) => refundableStatuses.has(status))
              : statuses;

            return (
              <article key={order.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-gray-900">#{order.id} · {order.service.name}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status] || statusStyles.PENDING}`}>
                        {order.status}
                      </span>
                      {order.refundedAt && (
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                          Refunded
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {order.service.provider || "RepairCore"} · {order.service.category} · {order.price.toString()} USD
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-gray-900">{order.user.name || "Customer"}</p>
                    <p className="text-gray-500">{order.user.email}</p>
                    <p className="mt-1 text-xs text-gray-400">{order.createdAt.toLocaleString("en-US")}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,1.25fr)]">
                  <section className="rounded-lg bg-gray-50 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Customer input</h3>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      {imei && (
                        <div>
                          <dt className="text-xs text-gray-500">IMEI (sensitive)</dt>
                          <dd className="mt-0.5 break-all font-mono font-semibold text-gray-900">{imei}</dd>
                        </div>
                      )}
                      {order.accountUsername && (
                        <div>
                          <dt className="text-xs text-gray-500">Tool account</dt>
                          <dd className="mt-0.5 break-all font-medium text-gray-900">{order.accountUsername}</dd>
                        </div>
                      )}
                      {order.deviceModel && (
                        <div>
                          <dt className="text-xs text-gray-500">Device model</dt>
                          <dd className="mt-0.5 font-medium text-gray-900">{order.deviceModel}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-xs text-gray-500">Authorization confirmed</dt>
                        <dd className="mt-0.5 font-medium text-gray-900">
                          {order.authorizationConfirmedAt.toLocaleString("en-US")}
                        </dd>
                      </div>
                    </dl>
                    {order.notes && (
                      <div className="mt-4 border-t border-gray-200 pt-3">
                        <p className="text-xs text-gray-500">Customer notes</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{order.notes}</p>
                      </div>
                    )}
                  </section>

                  <form action={updateGsmServiceOrder} className="grid content-start gap-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <label className="grid gap-1 text-sm font-semibold text-gray-700">
                      Status
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="rounded-lg border border-gray-300 px-3 py-2.5 font-normal text-gray-900"
                      >
                        {allowedStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-gray-700">
                      Result / admin note
                      <textarea
                        name="result"
                        defaultValue={order.result || ""}
                        maxLength={2_000}
                        rows={4}
                        placeholder="Result delivered to the customer, processing note, or rejection reason"
                        className="resize-y rounded-lg border border-gray-300 px-3 py-2.5 font-normal text-gray-900"
                      />
                    </label>
                    {order.refundedAt ? (
                      <p className="text-xs text-violet-700">
                        Refunded on {order.refundedAt.toLocaleString("en-US")}. The refund is locked and cannot be reversed.
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Choosing REJECTED or CANCELLED returns {order.price.toString()} USD to the customer automatically.
                      </p>
                    )}
                    <button
                      type="submit"
                      className="justify-self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Update order
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
