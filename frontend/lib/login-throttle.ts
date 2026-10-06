import "server-only";

import { prisma } from "@/lib/prisma";

// After MAX_FAILURES wrong passwords within WINDOW_MS, the email is locked for LOCK_MS.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

export async function isLoginLocked(email: string) {
  const entry = await prisma.loginThrottle.findUnique({ where: { key: email } });
  return Boolean(entry?.lockedUntil && entry.lockedUntil > new Date());
}

export async function recordLoginFailure(email: string) {
  const now = new Date();
  const entry = await prisma.loginThrottle.findUnique({ where: { key: email } });
  const windowExpired = !entry || now.getTime() - entry.windowStart.getTime() > WINDOW_MS;
  const failures = windowExpired ? 1 : entry.failures + 1;

  await prisma.loginThrottle.upsert({
    where: { key: email },
    create: { key: email, failures, windowStart: now },
    update: {
      failures,
      ...(windowExpired ? { windowStart: now } : {}),
      lockedUntil: failures >= MAX_FAILURES ? new Date(now.getTime() + LOCK_MS) : null,
    },
  });
}

export async function clearLoginFailures(email: string) {
  await prisma.loginThrottle.deleteMany({ where: { key: email } });
}
