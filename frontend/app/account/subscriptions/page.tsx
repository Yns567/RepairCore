import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function MySubscriptionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?next=/account/subscriptions");
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">My Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <p className="mt-8 text-slate-400">No active subscriptions yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {subscriptions.map((sub) => {
            const isActive = sub.status === "ACTIVE" && sub.endDate > new Date();
            const isPending = sub.status === "PENDING";
            return (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#111827] p-6"
              >
                <div>
                  <p className="font-semibold text-white">{sub.plan.name}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Expires on {sub.endDate.toLocaleDateString("en-US")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                  isActive ? "bg-green-600" : isPending ? "bg-amber-600" : "bg-red-600"
                  }`}
                >
                  {isActive ? "Active" : isPending ? "Pending activation" : "Expired"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
