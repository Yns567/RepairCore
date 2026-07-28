import Link from "next/link";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 text-sm ${
            !status ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm ${
              status === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <table className="mt-6 w-full border-collapse overflow-hidden rounded-xl bg-white text-gray-700 shadow-sm">
        <thead>
          <tr className="border-b bg-gray-100 text-left text-sm text-gray-600">
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="text-sm">
              <td className="px-4 py-3 font-medium">#{order.id}</td>
              <td className="px-4 py-3">
                <div>{order.fullName}</div>
                <div className="text-xs text-gray-500">
                  {order.user?.email}
                </div>
              </td>
              <td className="px-4 py-3">
                {order.items.reduce((n, i) => n + i.quantity, 0)}
              </td>
              <td className="px-4 py-3">{order.total.toString()} $</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {order.createdAt.toLocaleDateString("en-US")}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <p className="mt-8 text-center text-gray-500">No orders found.</p>
      )}
    </div>
  );
}
