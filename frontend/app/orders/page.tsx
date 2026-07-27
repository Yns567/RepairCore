import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const statusClasses: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300",
  PAID: "bg-blue-500/15 text-blue-300",
  SHIPPED: "bg-violet-500/15 text-violet-300",
  COMPLETED: "bg-emerald-500/15 text-emerald-300",
  CANCELLED: "bg-rose-500/15 text-rose-300",
};

export default async function OrdersPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?next=/orders");

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-400">MY ACCOUNT</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Orders</h1>
        </div>
        <Link href="/store" className="text-sm font-semibold text-blue-400 hover:text-blue-300">Continue shopping →</Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111827] p-10 text-center">
          <p className="text-lg font-semibold text-white">No orders yet</p>
          <p className="mt-2 text-sm text-slate-400">Your completed orders will appear here.</p>
          <Link href="/store" className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">Browse the store</Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-5 last:border-0 transition hover:bg-slate-800/50">
              <div>
                <p className="font-semibold text-white">Order #{order.id}</p>
                <p className="mt-1 text-sm text-slate-400">{order.createdAt.toLocaleDateString("en-US")} · {order._count.items} item{order._count.items === 1 ? "" : "s"}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-white">${Number(order.total).toFixed(2)}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[order.status] ?? "bg-slate-700 text-slate-200"}`}>{order.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
