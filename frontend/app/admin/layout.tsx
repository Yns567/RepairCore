import AdminLayout from "./AdminLayout";
import { requireAdmin } from "@/lib/authorization";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  // The admin panel is English-only, so keep it left-to-right even when the site is in Arabic.
  return (
    <div dir="ltr" lang="en">
      <AdminLayout>{children}</AdminLayout>
    </div>
  );
}
