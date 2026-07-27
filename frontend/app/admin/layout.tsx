import AdminLayout from "./AdminLayout";
import { requireAdmin } from "@/lib/authorization";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <AdminLayout>{children}</AdminLayout>;
}
