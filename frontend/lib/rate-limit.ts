import "server-only";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const PREFIX = "rl:";
const CLEANUP_AGE_MS = 24 * 60 * 60 * 1000;

/** Best-effort client IP. Vercel and Cloud Run both overwrite these headers at the edge. */
export function clientIp(source: Headers) {
  return (
    source.get("x-real-ip")?.trim() ||
    source.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function requestIp() {
  return clientIp(await headers());
}

/**
 * Fixed-window limiter backed by the LoginThrottle table (its `failures` column counts hits).
 * Returns false once `key` has been used more than `max` times within `windowMs`.
 */
export async function rateLimit(key: string, max: number, windowMs: number) {
  const id = PREFIX + key;
  const now = new Date();
  const entry = await prisma.loginThrottle.findUnique({ where: { key: id } });
  const expired = !entry || now.getTime() - entry.windowStart.getTime() > windowMs;
  const hits = expired ? 1 : entry.failures + 1;

  await prisma.loginThrottle.upsert({
    where: { key: id },
    create: { key: id, failures: 1, windowStart: now },
    update: expired ? { failures: 1, windowStart: now } : { failures: { increment: 1 } },
  });

  // Occasionally drop stale counters so the table does not grow forever.
  if (Math.random() < 0.02) {
    await prisma.loginThrottle
      .deleteMany({ where: { key: { startsWith: PREFIX }, windowStart: { lt: new Date(now.getTime() - CLEANUP_AGE_MS) } } })
      .catch(() => undefined);
  }

  return hits <= max;
}
