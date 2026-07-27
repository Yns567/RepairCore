"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";

const adjustmentSchema = z.object({
  userId: z.string().cuid(),
  amount: z.coerce.number().positive().max(10_000),
  type: z.enum(["CREDIT", "REFUND", "ADJUSTMENT"]),
  description: z.string().trim().min(3).max(200),
});

export async function addWalletCredit(formData: FormData) {
  const session = await requireAdmin();
  const adminId = session?.user?.id;
  if (!adminId) {
    throw new Error("Admin session is required.");
  }
  const parsed = adjustmentSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    throw new Error("Enter a valid positive amount and description.");
  }

  await prisma.$transaction((tx) =>
    creditWallet(tx, {
      ...parsed.data,
      createdById: adminId,
      referenceType: "ADMIN",
    }),
  );

  revalidatePath("/admin/wallets");
  revalidatePath("/account");
  revalidatePath("/account/wallet");
  revalidatePath("/checkout");
}
