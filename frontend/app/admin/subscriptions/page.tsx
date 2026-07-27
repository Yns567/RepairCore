import { prisma } from "@/lib/prisma";
import SubscriptionStatusSelect from "./SubscriptionStatusSelect";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: { user: { select: { name: true, email: true } }, plan: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Subscription requests</h1>
      <p className="mt-1 text-sm text-gray-500">Activate a request only after confirming its payment.</p>

      {subscriptions.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">No subscription requests yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[45rem] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Requested</th><th className="px-4 py-3">Ends</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{subscription.user.name || "Customer"}</p><p className="text-xs text-gray-500">{subscription.user.email}</p></td>
                  <td className="px-4 py-3"><p className="font-medium text-gray-800">{subscription.plan.name}</p><p className="text-xs text-gray-500">{subscription.plan.price.toString()} $</p></td>
                  <td className="px-4 py-3 text-gray-600">{subscription.createdAt.toLocaleDateString("en-US")}</td>
                  <td className="px-4 py-3 text-gray-600">{subscription.endDate.toLocaleDateString("en-US")}</td>
                  <td className="px-4 py-3"><SubscriptionStatusSelect id={subscription.id} status={subscription.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
