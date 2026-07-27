import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "RepairCore Administrator";

if (!email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 8) {
  throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters before creating an admin.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

try {
  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { name, hashedPassword, role: "ADMIN" },
    create: { name, email, hashedPassword, role: "ADMIN" },
  });

  console.log(`Admin account is ready for ${email}.`);
} finally {
  await prisma.$disconnect();
}
