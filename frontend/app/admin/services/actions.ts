"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { isBlockedService } from "@/lib/gsm-provider";
import { MONEY_PATTERN, toMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const updateServiceSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  price: z.coerce.number().positive().max(100_000),
  estimatedTime: z.string().trim().min(2).max(80),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  priceLocked: z.boolean(),
});

const createServiceSchema = z.object({
  name: z.string().trim().min(3).max(190),
  category: z.enum(["IMEI", "SERVER_CREDIT", "TOOL_RENTAL"]),
  inputType: z.enum(["IMEI", "USERNAME", "NONE"]),
  price: z.string().trim().regex(MONEY_PATTERN),
  estimatedTime: z.string().trim().min(2).max(80),
  provider: z.string().trim().max(120).transform((value) => value || null),
  description: z.string().trim().max(2000).transform((value) => value || null),
});

export async function createGsmService(formData: FormData) {
  await requireAdmin();
  const parsed = createServiceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error("Enter a name, category, input type, price and processing time.");
  }
  if (toMoney(parsed.data.price).lte(0)) throw new Error("The price must be greater than zero.");

  const base = parsed.data.name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "service";
  let slug = base;
  for (let suffix = 2; await prisma.gsmService.findUnique({ where: { slug }, select: { id: true } }); suffix += 1) {
    slug = `${base}-${suffix}`;
  }

  await prisma.gsmService.create({
    data: { ...parsed.data, price: toMoney(parsed.data.price), slug, status: "ACTIVE" },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function updateGsmService(formData: FormData) {
  await requireAdmin();

  const parsed = updateServiceSchema.safeParse({
    serviceId: formData.get("serviceId"),
    price: formData.get("price"),
    estimatedTime: formData.get("estimatedTime"),
    status: formData.get("status"),
    priceLocked: formData.get("priceLocked") === "on",
  });

  if (!parsed.success) {
    throw new Error("Enter a valid price, processing time, and service status.");
  }

  const service = await prisma.gsmService.findUnique({
    where: { id: parsed.data.serviceId },
    select: { slug: true, name: true, provider: true, externalId: true },
  });
  if (!service) {
    throw new Error("Service not found.");
  }
  if (parsed.data.status === "ACTIVE" && service.externalId && isBlockedService(service.name, service.provider)) {
    throw new Error("This service removes device protection and cannot be sold.");
  }

  await prisma.gsmService.update({
    where: { id: parsed.data.serviceId },
    data: {
      price: parsed.data.price,
      estimatedTime: parsed.data.estimatedTime,
      status: parsed.data.status,
      priceLocked: parsed.data.priceLocked,
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${service.slug}`);
}
