import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
};

const schemaVersion = "2026-07-11-guest-cart";

// During development, Fast Refresh keeps global state alive. Recreate the
// client after a Prisma schema change so new delegates (such as `cart`) exist.
if (
  !globalForPrisma.prisma ||
  globalForPrisma.prismaSchemaVersion !== schemaVersion
) {
  globalForPrisma.prisma = new PrismaClient({
    adapter,
  });
  globalForPrisma.prismaSchemaVersion = schemaVersion;
}

export const prisma = globalForPrisma.prisma;
