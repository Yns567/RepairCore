import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId < 1) {
    notFound();
  }

  const [order, { t, tKey }] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    }),
    getT(),
  ]);

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const cancelled = order.status === "CANCELLED";

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className={`rounded-2xl border p-6 text-center ${cancelled ? "border-rose-700 bg-rose-950/30" : "border-green-700 bg-green-950/30"}`}>
        <h1 className="text-2xl font-bold text-white">{cancelled ? t("orders.cancelledTitle") : t("orders.placed")}</h1>
        <p className="mt-2 text-slate-400">
          {t("orders.number", { id: order.id })} — {tKey(`status.${order.status}`, order.status)}
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#111827] p-4"
          >
            <span className="text-white">
              {item.product.name} × {item.quantity}
            </span>
            <span className="text-blue-400" dir="ltr">
              {item.unitPrice.times(item.quantity).toFixed(2)} {order.currency}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <span className="text-slate-300">{t("orders.total")}</span>
        <span className="text-2xl font-bold text-blue-400" dir="ltr">
          {order.total.toFixed(2)} {order.currency}
        </span>
      </div>
    </main>
  );
}
