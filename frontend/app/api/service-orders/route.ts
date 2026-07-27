import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encryptSensitiveValue } from "@/lib/sensitive-data";
import { debitWallet, InsufficientBalanceError } from "@/lib/wallet";

const requestSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  requestId: z.string().uuid(),
  expectedPrice: z.coerce.number().positive().finite(),
  imei: z.string().trim().max(20).optional().default(""),
  accountUsername: z.string().trim().max(120).optional().default(""),
  deviceModel: z.string().trim().max(100).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
  authorizationConfirmed: z.literal(true),
});

function isValidImei(value: string) {
  if (!/^\d{15}$/.test(value)) return false;

  let sum = 0;
  for (let index = 0; index < value.length; index += 1) {
    let digit = Number(value[index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Please sign in before placing an order." }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please review the order details and try again." }, { status: 400 });
  }

  const priorOrder = await prisma.gsmServiceOrder.findUnique({
    where: { clientRequestId: parsed.data.requestId },
  });
  if (priorOrder) {
    if (priorOrder.userId !== userId) {
      return NextResponse.json({ error: "This request identifier is already in use." }, { status: 409 });
    }
    return NextResponse.json({ id: priorOrder.id, existing: true }, { status: 200 });
  }

  const service = await prisma.gsmService.findUnique({ where: { id: parsed.data.serviceId } });
  if (!service || service.status !== "ACTIVE") {
    return NextResponse.json({ error: "This service is not available right now." }, { status: 404 });
  }

  const currentPrice = Number(service.price);
  if (Math.abs(currentPrice - parsed.data.expectedPrice) > 0.0001) {
    return NextResponse.json(
      { error: "The service price changed. Refresh the page and review the new price." },
      { status: 409 },
    );
  }

  if (service.inputType === "IMEI" && !isValidImei(parsed.data.imei)) {
    return NextResponse.json({ error: "Enter a valid 15-digit IMEI." }, { status: 400 });
  }

  if (service.inputType === "USERNAME" && parsed.data.accountUsername.length < 2) {
    return NextResponse.json({ error: "Enter the existing tool account username or email." }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.gsmServiceOrder.findUnique({
        where: { clientRequestId: parsed.data.requestId },
      });
      if (existingOrder) {
        if (existingOrder.userId !== userId) {
          throw new Error("Request identifier is already in use.");
        }
        return { order: existingOrder, existing: true };
      }

      const createdOrder = await tx.gsmServiceOrder.create({
        data: {
          clientRequestId: parsed.data.requestId,
          userId,
          serviceId: service.id,
          price: service.price,
          imei: service.inputType === "IMEI" ? encryptSensitiveValue(parsed.data.imei) : null,
          accountUsername: service.inputType === "USERNAME" ? parsed.data.accountUsername : null,
          deviceModel: parsed.data.deviceModel || null,
          notes: parsed.data.notes || null,
          authorizationConfirmedAt: new Date(),
        },
      });

      await debitWallet(tx, {
        userId,
        amount: currentPrice,
        description: `Payment for GSM service order #${createdOrder.id}`,
        referenceType: "GSM_SERVICE_ORDER",
        referenceId: String(createdOrder.id),
      });

      return { order: createdOrder, existing: false };
    });

    return NextResponse.json(
      { id: order.order.id, existing: order.existing },
      { status: order.existing ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof InsufficientBalanceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if ((error as { code?: string }).code === "P2002") {
      const existingOrder = await prisma.gsmServiceOrder.findUnique({
        where: { clientRequestId: parsed.data.requestId },
      });
      if (existingOrder?.userId === userId) {
        return NextResponse.json({ id: existingOrder.id, existing: true }, { status: 200 });
      }
    }

    return NextResponse.json(
      { error: "We could not create this service order. Your balance was not charged." },
      { status: 500 },
    );
  }
}
