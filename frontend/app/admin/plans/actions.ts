"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { MONEY_PATTERN, toMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const planSchema = z.object({
  name: z.string().trim().min(3).max(120),
  softwareName: z.string().trim().min(2).max(60),
  billingPeriod: z.enum(["MONTHLY", "YEARLY", "RENTAL_DAY", "RENTAL_WEEK"]),
  price: z.string().trim().regex(MONEY_PATTERN).refine((value) => toMoney(value).gt(0)),
  description: z.string().trim().max(1000).transform((value) => value || null),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

function readPlan(formData: FormData) {
  const parsed = planSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Enter a name, software, billing period and a positive price.");
  const { price, ...rest } = parsed.data;
  return { ...rest, price: toMoney(price), isRental: rest.billingPeriod.startsWith("RENTAL") };
}

function refresh() {
  revalidatePath("/admin/plans");
  revalidatePath("/software");
}

export async function createPlan(formData: FormData) {
  await requireAdmin();
  const data = readPlan(formData);
  const base = `${data.softwareName}-${data.name}`.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "plan";
  let slug = base;
  for (let suffix = 2; await prisma.subscriptionPlan.findUnique({ where: { slug }, select: { id: true } }); suffix += 1) {
    slug = `${base}-${suffix}`;
  }
  await prisma.subscriptionPlan.create({ data: { ...data, slug } });
  refresh();
}

export async function updatePlan(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid plan.");
  await prisma.subscriptionPlan.update({ where: { id }, data: readPlan(formData) });
  refresh();
}
