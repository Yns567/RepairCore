import { prisma } from "@/lib/prisma";
import PlanCard from "@/components/software/PlanCard";

export default async function SoftwarePage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ softwareName: "asc" }, { price: "asc" }],
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="text-4xl font-bold text-white">
        Software Subscriptions & Rentals
      </h1>

      <p className="mt-4 text-slate-400">
        Activate a subscription or rent the repair software you need, no long
        commitment required.
      </p>

      {plans.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">
          No plans available right now.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              id={plan.id}
              name={plan.name}
              softwareName={plan.softwareName}
              description={plan.description}
              price={plan.price.toString()}
              billingPeriod={plan.billingPeriod}
              isRental={plan.isRental}
            />
          ))}
        </div>
      )}
    </main>
  );
}
