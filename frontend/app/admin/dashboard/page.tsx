import Link from "next/link";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

function currency(value: number) {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} $`;
}

export default async function AdminDashboardPage() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    productCount,
    userCount,
    orderCount,
    lowStockProducts,
    recentOrders,
    last7DaysOrders,
    todayAgg,
    monthAgg,
    allTimeAgg,
    pendingCount,
    topSellersRaw,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
    prisma.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const pendingOrdersCount = pendingCount;

  const topSellerProducts = await prisma.product.findMany({
    where: { id: { in: topSellersRaw.map((t) => t.productId) } },
  });

  const topSellers = topSellersRaw
    .map((t) => {
      const product = topSellerProducts.find((p) => p.id === t.productId);
      return product
        ? { product, unitsSold: t._sum.quantity ?? 0 }
        : null;
    })
    .filter((x): x is { product: (typeof topSellerProducts)[number]; unitsSold: number } => x !== null);

  const todayRevenue = Number(todayAgg._sum.total ?? 0);
  const monthRevenue = Number(monthAgg._sum.total ?? 0);
  const totalRevenue = Number(allTimeAgg._sum.total ?? 0);
  const totalOrders = allTimeAgg._count;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // 7-day revenue series for the chart
  const days: { label: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const revenue = last7DaysOrders
      .filter((o) => o.createdAt >= d && o.createdAt < next)
      .reduce((sum, o) => sum + Number(o.total), 0);
    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      revenue,
    });
  }
  const maxRevenue = Math.max(1, ...days.map((d) => d.revenue));

  const heroStats = [
    {
      label: "Today's Revenue",
      value: currency(todayRevenue),
      sub: `${todayAgg._count} orders today`,
      accent: "bg-emerald-500",
    },
    {
      label: "This Month's Revenue",
      value: currency(monthRevenue),
      sub: `${monthAgg._count} orders this month`,
      accent: "bg-blue-500",
    },
    {
      label: "Avg. Order Value",
      value: currency(avgOrderValue),
      sub: `${pendingOrdersCount} pending`,
      accent: "bg-violet-500",
    },
    {
      label: "All-Time Revenue",
      value: currency(totalRevenue),
      sub: `${totalOrders} orders total`,
      accent: "bg-amber-500",
    },
  ];

  const secondaryStats = [
    { label: "Products", value: productCount },
    { label: "Users", value: userCount },
    { label: "Orders", value: orderCount },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Store performance at a glance.
        </p>
      </div>

      {/* Revenue stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {heroStats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <span className={`absolute inset-x-0 top-0 h-1 ${stat.accent}`} />
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary counts */}
      <div className="grid grid-cols-3 gap-4">
        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Sales, last 7 days</h2>
            <span className="text-xs text-gray-400">
              {currency(days.reduce((s, d) => s + d.revenue, 0))} total
            </span>
          </div>

          <div className="mt-6 flex h-32 items-end gap-3">
            {days.map((day) => (
              <div
                key={day.label}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <div className="relative flex h-24 w-full items-end">
                  <div
                    className="w-full rounded-t-md bg-blue-500 transition-all"
                    style={{
                      height: `${(day.revenue / maxRevenue) * 100}%`,
                      minHeight: day.revenue > 0 ? "6px" : "2px",
                      backgroundColor:
                        day.revenue === 0 ? "#e5e7eb" : undefined,
                    }}
                    title={currency(day.revenue)}
                  />
                </div>
                <span className="text-xs text-gray-400">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Low Stock</h2>
          <p className="mt-1 text-xs text-gray-400">5 units or fewer</p>

          <div className="mt-4 space-y-3">
            {lowStockProducts.length === 0 && (
              <p className="text-sm text-gray-400">
                All products are well stocked.
              </p>
            )}
            {lowStockProducts.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}/edit`}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50"
              >
                <span className="truncate text-sm text-gray-700">
                  {product.name}
                </span>
                <span
                  className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.stock === 0
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {product.stock} left
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 p-6 pb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 && (
              <p className="p-6 text-sm text-gray-400">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    #{order.id} — {order.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.createdAt.toLocaleDateString("en-US")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {currency(Number(order.total))}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Best sellers */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Best Sellers</h2>
          <p className="mt-1 text-xs text-gray-400">By units sold</p>

          <div className="mt-4 space-y-3">
            {topSellers.length === 0 && (
              <p className="text-sm text-gray-400">No sales data yet.</p>
            )}
            {topSellers.map((item, index) => (
              <Link
                key={item.product.id}
                href={`/admin/products/${item.product.id}/edit`}
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="flex-1 truncate text-sm text-gray-700">
                  {item.product.name}
                </span>
                <span className="shrink-0 text-xs font-medium text-gray-500">
                  {item.unitsSold} sold
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/orders?status=PENDING"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Review Pending Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
