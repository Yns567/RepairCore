import { prisma } from "@/lib/prisma";
import { createPlan, updatePlan } from "./actions";

const labelClass = "grid gap-1 text-xs font-medium text-gray-600";
const fieldClass = "rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900";
const periods = [
  { value: "MONTHLY", label: "Monthly subscription" },
  { value: "YEARLY", label: "Yearly subscription" },
  { value: "RENTAL_DAY", label: "Rental — 1 day" },
  { value: "RENTAL_WEEK", label: "Rental — 1 week" },
];

type PlanDefaults = {
  id?: number; name?: string; softwareName?: string; billingPeriod?: string;
  price?: string; description?: string | null; status?: string;
};

function PlanFields({ plan = {} }: { plan?: PlanDefaults }) {
  return (
    <>
      <label className={labelClass}>Software<input name="softwareName" required minLength={2} maxLength={60} defaultValue={plan.softwareName} placeholder="UnlockTool" className={fieldClass} /></label>
      <label className={labelClass}>Plan name<input name="name" required minLength={3} maxLength={120} defaultValue={plan.name} placeholder="6 hours rent" className={fieldClass} /></label>
      <label className={labelClass}>Billing
        <select name="billingPeriod" defaultValue={plan.billingPeriod ?? "MONTHLY"} className={fieldClass}>
          {periods.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
        </select>
      </label>
      <label className={labelClass}>Price (USD)<input name="price" required inputMode="decimal" pattern="\d{1,8}(\.\d{1,2})?" defaultValue={plan.price} placeholder="15.00" className={fieldClass} /></label>
      <label className={labelClass}>Status
        <select name="status" defaultValue={plan.status === "INACTIVE" ? "INACTIVE" : "ACTIVE"} className={fieldClass}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Hidden</option>
        </select>
      </label>
      <label className={`${labelClass} sm:col-span-2 lg:col-span-3`}>Description (optional)<input name="description" maxLength={1000} defaultValue={plan.description ?? ""} className={fieldClass} /></label>
    </>
  );
}

export default async function AdminPlansPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: [{ softwareName: "asc" }, { price: "asc" }],
    include: { _count: { select: { subscriptions: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Software plans</h1>
      <p className="mt-1 text-sm text-gray-500">
        Customers pay from their USD balance. Each purchase appears under Subscriptions as PENDING until you deliver it and set it ACTIVE.
      </p>

      <details className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm" open={plans.length === 0}>
        <summary className="cursor-pointer font-semibold text-blue-700">+ Add a plan</summary>
        <form action={createPlan} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PlanFields />
          <div><button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Add plan</button></div>
        </form>
      </details>

      <div className="mt-6 space-y-4">
        {plans.map((plan) => (
          <form key={plan.id} action={updatePlan} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="id" value={plan.id} />
            <PlanFields plan={{ ...plan, price: plan.price.toFixed(2) }} />
            <div className="flex items-end gap-3">
              <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Save</button>
              <span className="pb-2 text-xs text-gray-500">{plan._count.subscriptions} purchase(s)</span>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
