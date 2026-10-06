"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { isBlockedService } from "@/lib/gsm-provider";
import { prisma } from "@/lib/prisma";

const updateServiceSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  price: z.coerce.number().positive().max(100_000),
  estimatedTime: z.string().trim().min(2).max(80),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  priceLocked: z.boolean(),
});

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
