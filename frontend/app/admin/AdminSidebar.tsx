import Link from "next/link";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/services", label: "GSM Services" },
  { href: "/admin/service-orders", label: "Service Orders" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/wallets", label: "Balances" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white text-gray-900">
      <div className="border-b border-gray-200 p-4 text-lg font-bold">RepairCore Admin</div>
      <nav className="flex flex-col gap-1 p-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
