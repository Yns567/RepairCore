import { getProviderAccount, isProviderConfigured } from "@/lib/gsm-provider";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { refreshStatusesAction, retrySubmissionAction, syncServicesAction } from "./actions";

export const maxDuration = 60;

export default async function AdminProviderPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const configured = isProviderConfigured();

  let account: Awaited<ReturnType<typeof getProviderAccount>> = null;
  let accountError: string | null = null;
  if (configured) {
    try {
      account = await getProviderAccount();
    } catch (error) {
      accountError = error instanceof Error ? error.message : "Could not reach the provider.";
    }
  }

  const [linkedCount, activeCount, stuck, processingCount] = await Promise.all([
    prisma.gsmService.count({ where: { externalId: { not: null } } }),
    prisma.gsmService.count({ where: { externalId: { not: null }, status: "ACTIVE" } }),
    prisma.gsmServiceOrder.findMany({
      where: { status: "PENDING", submitError: { not: null } },
      include: { service: { select: { name: true } }, user: { select: { email: true } } },
      orderBy: { createdAt: "asc" },
      take: 50,
    }),
    prisma.gsmServiceOrder.count({ where: { status: "PROCESSING", externalReference: { not: null } } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">GSM provider</h1>
      <p className="mt-1 text-sm text-gray-500">
        Orders for linked services are sent to the provider automatically and their results are collected every few minutes.
        Services that remove Activation Lock, passcodes or other theft protection are never imported.
      </p>

      {message && <p className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Connection</p>
          {!configured ? (
            <p className="mt-1 font-semibold text-amber-700">Not configured</p>
          ) : accountError ? (
            <p className="mt-1 font-semibold text-rose-700">{accountError}</p>
          ) : (
            <>
              <p className="mt-1 font-semibold text-emerald-700">Connected</p>
              <p className="mt-1 text-sm text-gray-700">Provider balance: {account?.credit ?? "—"}</p>
            </>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Linked services</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{activeCount} <span className="text-sm font-normal text-gray-500">active of {linkedCount}</span></p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Orders processing at provider</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{processingCount}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <form action={syncServicesAction}>
          <button disabled={!configured} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300">
            Sync services &amp; prices
          </button>
        </form>
        <form action={refreshStatusesAction}>
          <button disabled={!configured} className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-800 hover:bg-gray-50 disabled:text-gray-400">
            Check order statuses now
          </button>
        </form>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Sale price = provider cost + {process.env.GSM_MARKUP_PERCENT || "20"}% (at least +{process.env.GSM_MIN_PROFIT || "0.50"} USD).
        Tick &quot;price locked&quot; on a service to keep your own price.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-gray-900">Orders needing attention ({stuck.length})</h2>
      <p className="mt-1 text-sm text-gray-500">The customer has paid but the order could not be sent. Top up your provider balance if needed, then retry — or reject the order from Service Orders to refund it.</p>
      {stuck.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Nothing waiting.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Error</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {stuck.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">#{order.id}<p className="text-xs text-gray-500">{formatMoney(order.price, order.currency)}</p></td>
                  <td className="px-4 py-3">{order.service.name}</td>
                  <td className="px-4 py-3">{order.user.email}</td>
                  <td className="px-4 py-3 text-rose-700">{order.submitError}</td>
                  <td className="px-4 py-3">
                    <form action={retrySubmissionAction}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <button className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">Retry</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
