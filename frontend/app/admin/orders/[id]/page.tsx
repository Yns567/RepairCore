import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deliverOrder } from "../actions";
import OrderStatusSelect from "./OrderStatusSelect";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: true } },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Orders
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Order #{order.id}
        </h1>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Customer</h2>
          <p className="mt-2 text-sm text-gray-700">{order.fullName}</p>
          <p className="text-sm text-gray-500">{order.user?.email}</p>
          <p className="text-sm text-gray-500">{order.phone}</p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Shipping</h2>
          <p className="mt-2 text-sm text-gray-700">
            {order.address}, {order.city}
          </p>
          {order.notes && (
            <p className="mt-2 text-sm text-gray-500">
              Notes: {order.notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white shadow-sm">
        <table className="w-full border-collapse text-gray-700">
          <thead>
            <tr className="border-b bg-gray-100 text-left text-sm text-gray-600">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id} className="text-sm">
                <td className="px-4 py-3">{item.product.name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{item.unitPrice.toFixed(2)} {order.currency}</td>
                <td className="px-4 py-3">
                  {item.unitPrice.times(item.quantity).toFixed(2)} {order.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t p-4">
          <span className="text-lg font-bold text-gray-900">
            Total: {order.total.toFixed(2)} {order.currency}
          </span>
        </div>
      </div>

      <form action={deliverOrder} className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
        <input type="hidden" name="id" value={order.id} />
        <h2 className="font-semibold text-gray-900">Digital delivery</h2>
        <p className="mt-1 text-xs text-gray-500">
          For digital products: enter the activation code or details. Saving emails it to the customer and shows it on their order page.
        </p>
        <textarea
          name="deliveryNote"
          defaultValue={order.deliveryNote ?? ""}
          rows={3}
          placeholder="e.g. License key: XXXX-XXXX-XXXX"
          className="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-3">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Save &amp; email customer
          </button>
          {order.deliveryNote && <span className="text-xs text-emerald-600">✓ Delivered</span>}
        </div>
      </form>
    </div>
  );
}
