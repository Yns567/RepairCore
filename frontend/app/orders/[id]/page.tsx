import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const statusLabels: Record<string, string> = {
  PENDING: "Processing",
  PAID: "Paid",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

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

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-2xl border border-green-700 bg-green-950/30 p-6 text-center">
        <h1 className="text-2xl font-bold text-white">
          Order placed successfully ✓
        </h1>
        <p className="mt-2 text-slate-400">
          Order #{order.id} — {statusLabels[order.status]}
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
            <span className="text-blue-400">
              {(Number(item.unitPrice) * item.quantity).toFixed(2)} $
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <span className="text-slate-300">Total</span>
        <span className="text-2xl font-bold text-blue-400">
          {order.total.toString()} $
        </span>
      </div>
    </main>
  );
}
