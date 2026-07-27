import "server-only";

import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();

  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return session;
}
