import { prisma } from "@/lib/prisma";
import PlanCard from "@/components/software/PlanCard";
import { getT } from "@/lib/i18n/server";

export default async function SoftwarePage() {
  const { t } = await getT();
  const plans = await prisma.subscriptionPlan.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ softwareName: "asc" }, { price: "asc" }],
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 md:py-12">
      <h1 className="text-2xl font-bold md:text-4xl text-white">
        {t("software.title")}
      </h1>

      <p className="mt-4 text-slate-400">
        {t("software.subtitle")}
      </p>

      {plans.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">
          {t("software.empty")}
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
