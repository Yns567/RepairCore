import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export default async function MySubscriptionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?next=/account/subscriptions");
  }

  const [subscriptions, { t, formatDay }] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: session.user.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    getT(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl text-white">{t("subs.title")}</h1>

      {subscriptions.length === 0 ? (
        <p className="mt-8 text-slate-400">{t("subs.empty")}</p>
      ) : (
        <div className="mt-8 space-y-4">
          {subscriptions.map((sub) => {
            const isActive = sub.status === "ACTIVE" && sub.endDate > new Date();
            const isPending = sub.status === "PENDING";
            const label = isActive
              ? t("status.ACTIVE")
              : isPending
                ? t("status.pendingActivation")
                : sub.status === "CANCELLED" ? t("status.CANCELLED") : t("status.EXPIRED");
            return (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#111827] p-6"
              >
                <div>
                  <p className="font-semibold text-white">{sub.plan.softwareName} · {sub.plan.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{t("subs.expires", { date: formatDay(sub.endDate) })}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                    isActive ? "bg-green-600" : isPending ? "bg-amber-600" : "bg-red-600"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
