import Link from "next/link";
import { auth } from "@/auth";

export default async function AdminTopbar() {
  const session = await auth();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <span className="text-sm text-gray-500">Admin Panel</span>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{session?.user?.email}</span>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          View Site
        </Link>
      </div>
    </header>
  );
}
