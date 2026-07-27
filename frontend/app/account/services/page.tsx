import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, RotateCcw, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptSensitiveValue } from "@/lib/sensitive-data";

const statusStyles: Record<string, string> = {
  PENDING: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  PROCESSING: "border-blue-500/25 bg-blue-500/10 text-blue-300",
  COMPLETED: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  REJECTED: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  CANCELLED: "border-slate-600 bg-slate-700/40 text-slate-300",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const categoryLabels: Record<string, string> = {
  IMEI: "IMEI service",
  SERVER_CREDIT: "Tool credits",
  TOOL_RENTAL: "Tool rental",
};

export default async function AccountServicesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?next=/account/services");
  }

  const orders = await prisma.gsmServiceOrder.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      price: true,
      imei: true,
      accountUsername: true,
      deviceModel: true,
      result: true,
      refundedAt: true,
      createdAt: true,
      service: {
        select: {
          name: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-400">MY ACCOUNT</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Service orders</h1>
          <p className="mt-2 text-slate-400">
            Track IMEI checks, tool credits and rental requests.
          </p>
        </div>
        <Link
          href="/services"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Order a service
        </Link>
      </div>

      {orders.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-slate-800 bg-[#111827] p-10 text-center">
          <ShieldCheck className="mx-auto text-blue-400" size={34} />
          <h2 className="mt-4 text-lg font-semibold text-white">No service orders yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            Your IMEI checks, credit purchases and tool rentals will appear here.
          </p>
          <Link
            href="/services"
            className="mt-6 inline-block text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            Browse GSM services →
          </Link>
        </section>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const maskedImei = maskImei(order.imei);
            const identifier = maskedImei ?? order.accountUsername;

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{order.service.name}</p>
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                        {categoryLabels[order.service.category] ?? order.service.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      Order #{order.id} · {order.createdAt.toLocaleDateString("en-US")}
                    </p>
                    {(identifier || order.deviceModel) && (
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-300">
                        {identifier && (
                          <span>
                            {maskedImei ? "IMEI" : "Account"}:{" "}
                            <span className="font-mono text-slate-200">{identifier}</span>
                          </span>
                        )}
                        {order.deviceModel && <span>Device: {order.deviceModel}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-white">${Number(order.price).toFixed(2)}</span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusStyles[order.status] ?? "border-slate-600 bg-slate-700/40 text-slate-300"
                      }`}
                    >
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>
                </div>

                {(order.result || order.refundedAt) && (
                  <div className="border-t border-slate-800 bg-slate-950/25 px-5 py-4 sm:px-6">
                    {order.result && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Service result
                        </p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                          {order.result}
                        </p>
                      </div>
                    )}
                    {order.refundedAt && (
                      <p className={`${order.result ? "mt-4" : ""} flex items-center gap-2 text-sm font-medium text-emerald-300`}>
                        <RotateCcw size={15} />
                        Refunded to your balance on {order.refundedAt.toLocaleDateString("en-US")}
                      </p>
                    )}
                  </div>
                )}

                {!order.result && !order.refundedAt && order.status !== "COMPLETED" && (
                  <div className="flex items-center gap-2 border-t border-slate-800 px-5 py-3 text-xs text-slate-500 sm:px-6">
                    <Clock3 size={14} />
                    Updates and the final result will appear here.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function maskImei(encryptedValue: string | null) {
  if (!encryptedValue) return null;

  try {
    const decryptedValue = decryptSensitiveValue(encryptedValue);
    const lastFour = decryptedValue.replace(/\D/g, "").slice(-4);
    return lastFour ? `${"•".repeat(11)}${lastFour}` : "IMEI protected";
  } catch {
    return "IMEI protected";
  }
}
