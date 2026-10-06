"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { isCurrency, MONEY_PATTERN, toMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";

const reviewSchema = z.object({
  id: z.coerce.number().int().positive(),
  decision: z.enum(["APPROVE", "REJECT"]),
  creditedAmount: z.string().trim(),
  adminNote: z.string().trim().max(300).transform((value) => value || null),
});

export async function reviewTopUp(formData: FormData) {
  const session = await requireAdmin();
  const adminId = session?.user?.id;
  if (!adminId) throw new Error("Admin session is required.");

  const parsed = reviewSchema.safeParse({
    id: formData.get("id"),
    decision: formData.get("decision"),
    creditedAmount: formData.get("creditedAmount") ?? "",
    adminNote: formData.get("adminNote") ?? "",
  });
  if (!parsed.success) throw new Error("Invalid review.");
  const { id, decision, adminNote } = parsed.data;

  if (decision === "APPROVE" && !MONEY_PATTERN.test(parsed.data.creditedAmount)) {
    throw new Error("Enter the amount to credit (max 2 decimals).");
  }

  await prisma.$transaction(async (tx) => {
    const request = await tx.topUpRequest.findUnique({
      where: { id },
      select: { id: true, userId: true, currency: true, bank: true, status: true },
    });
    if (!request) throw new Error("Top-up request not found.");

    // Claim the request so two admins can never credit it twice.
    const claim = await tx.topUpRequest.updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
        creditedAmount: decision === "APPROVE" ? toMoney(parsed.data.creditedAmount) : null,
        adminNote,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });
    if (claim.count !== 1) throw new Error("This request was already reviewed.");

    if (decision === "APPROVE") {
      if (!isCurrency(request.currency)) throw new Error("Unsupported currency.");
      await creditWallet(tx, {
        userId: request.userId,
        currency: request.currency,
        amount: parsed.data.creditedAmount,
        type: "CREDIT",
        description: `Bank transfer top-up #${request.id} (${request.bank})`,
        referenceType: "TOP_UP",
        referenceId: String(request.id),
        createdById: adminId,
      });
    }
  });

  revalidatePath("/admin/top-ups");
  revalidatePath("/admin/wallets");
  revalidatePath("/account/wallet");
}
