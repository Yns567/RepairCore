import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  // The role in the JWT can be stale (a demoted or deleted admin keeps a valid
  // cookie until it expires), so confirm it against the database every time.
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return session;
}
