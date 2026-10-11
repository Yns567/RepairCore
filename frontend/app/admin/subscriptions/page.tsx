import { prisma } from "@/lib/prisma";
import { deliverSubscription } from "./actions";
import SubscriptionStatusSelect from "./SubscriptionStatusSelect";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: { user: { select: { name: true, email: true } }, plan: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Subscription requests</h1>
      <p className="mt-1 text-sm text-gray-500">
        After confirming payment, enter the activation code or details and click Deliver — the customer is emailed and the subscription is activated.
      </p>

      {subscriptions.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">No subscription requests yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {subscription.plan.softwareName} · {subscription.plan.name}
                    <span className="ml-2 text-sm font-normal text-gray-500">${subscription.plan.price.toFixed(2)}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{subscription.user.name || "Customer"} · {subscription.user.email}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Requested {subscription.createdAt.toLocaleDateString("en-US")} · ends {subscription.endDate.toLocaleDateString("en-US")}
                  </p>
                </div>
                <SubscriptionStatusSelect id={subscription.id} status={subscription.status} />
              </div>

              <form action={deliverSubscription} className="mt-4 border-t border-gray-100 pt-4">
                <input type="hidden" name="id" value={subscription.id} />
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Activation code / details for the customer
                </label>
                <textarea
                  name="deliveryNote"
                  defaultValue={subscription.deliveryNote ?? ""}
                  rows={3}
                  placeholder="e.g. Username: ... · Password: ... · License key: ..."
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <div className="mt-2 flex items-center gap-3">
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Deliver &amp; email customer
                  </button>
                  {subscription.deliveryNote && <span className="text-xs text-emerald-600">✓ Delivered — edit and resend anytime</span>}
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
