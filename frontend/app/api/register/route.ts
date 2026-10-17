import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  // Honeypot: hidden from people, bots tend to fill it in.
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const { t } = await getT();
  if (!(await rateLimit(`register:${clientIp(request.headers)}`, 5, 60 * 60 * 1000))) {
    return NextResponse.json({ error: t("auth.tooMany") }, { status: 429 });
  }

  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: t("auth.registerInvalid") }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: t("auth.registerExists") }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      hashedPassword: await bcrypt.hash(parsed.data.password, 12),
    },
  });

  return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
}
