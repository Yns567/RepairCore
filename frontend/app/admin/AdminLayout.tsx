import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-theme flex min-h-screen bg-gray-50 text-gray-900">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminTopbar />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
