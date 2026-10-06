import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

// Receipts are private: served only to administrators, never cached publicly.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) return new Response("Not found", { status: 404 });

  const request = await prisma.topUpRequest.findUnique({
    where: { id },
    select: { receipt: true, receiptType: true },
  });
  if (!request) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(request.receipt), {
    headers: {
      "Content-Type": request.receiptType,
      "Content-Disposition": `inline; filename="receipt-${id}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
