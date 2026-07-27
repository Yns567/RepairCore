import { auth, signOut } from "@/auth";
import { LogOut } from "lucide-react";

export default async function AdminTopbar() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4 text-slate-200">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">
            {session?.user?.name ?? "Admin"}
          </p>
          <p className="text-xs text-slate-400">{session?.user?.email}</p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            <LogOut size={16} />
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
