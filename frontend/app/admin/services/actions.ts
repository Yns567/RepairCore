"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const updateServiceSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  price: z.coerce.number().positive().max(100_000),
  estimatedTime: z.string().trim().min(2).max(80),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export async function updateGsmService(formData: FormData) {
  await requireAdmin();

  const parsed = updateServiceSchema.safeParse({
    serviceId: formData.get("serviceId"),
    price: formData.get("price"),
    estimatedTime: formData.get("estimatedTime"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error("Enter a valid price, processing time, and service status.");
  }

  const service = await prisma.gsmService.findUnique({
    where: { id: parsed.data.serviceId },
    select: { slug: true },
  });
  if (!service) {
    throw new Error("Service not found.");
  }

  await prisma.gsmService.update({
    where: { id: parsed.data.serviceId },
    data: {
      price: parsed.data.price,
      estimatedTime: parsed.data.estimatedTime,
      status: parsed.data.status,
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${service.slug}`);
}
