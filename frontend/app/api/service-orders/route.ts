import { after, NextResponse } from "next/server";
import { isBlockedService, submitOrderToProvider } from "@/lib/gsm-provider";
import { z } from "zod";
import { auth } from "@/auth";
import { MONEY_PATTERN, PRICING_CURRENCY, toMoney } from "@/lib/money";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { encryptSensitiveValue } from "@/lib/sensitive-data";
import { debitWallet, InsufficientBalanceError } from "@/lib/wallet";

// Leaves time for the provider submission that runs after the response.
export const maxDuration = 60;

const requestSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  requestId: z.string().uuid(),
  expectedPrice: z.union([z.string(), z.number()]).transform(String).pipe(z.string().regex(MONEY_PATTERN)),
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
  const { t } = await getT();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: t("err.signIn") }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: t("err.details") }, { status: 400 });
  }

  const priorOrder = await prisma.gsmServiceOrder.findUnique({
    where: { clientRequestId: parsed.data.requestId },
  });
  if (priorOrder) {
    if (priorOrder.userId !== userId) {
      return NextResponse.json({ error: t("err.requestUsed") }, { status: 409 });
    }
    return NextResponse.json({ id: priorOrder.id, existing: true }, { status: 200 });
  }

  const service = await prisma.gsmService.findUnique({ where: { id: parsed.data.serviceId } });
  if (!service || service.status !== "ACTIVE" || (service.externalId && isBlockedService(service.name, service.provider))) {
    return NextResponse.json({ error: t("err.serviceUnavailable") }, { status: 404 });
  }

  const currentPrice = toMoney(service.price);
  if (!currentPrice.equals(toMoney(parsed.data.expectedPrice))) {
    return NextResponse.json(
      { error: t("err.priceChanged") },
      { status: 409 },
    );
  }

  if (service.inputType === "IMEI" && !isValidImei(parsed.data.imei)) {
    return NextResponse.json({ error: t("err.imei") }, { status: 400 });
  }

  if (service.inputType === "USERNAME" && parsed.data.accountUsername.length < 2) {
    return NextResponse.json({ error: t("err.username") }, { status: 400 });
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
          currency: PRICING_CURRENCY.gsmService,
          imei: service.inputType === "IMEI" ? encryptSensitiveValue(parsed.data.imei) : null,
          accountUsername: service.inputType === "USERNAME" ? parsed.data.accountUsername : null,
          deviceModel: parsed.data.deviceModel || null,
          notes: parsed.data.notes || null,
          authorizationConfirmedAt: new Date(),
        },
      });

      await debitWallet(tx, {
        userId,
        currency: PRICING_CURRENCY.gsmService,
        amount: currentPrice,
        description: `Payment for GSM service order #${createdOrder.id}`,
        referenceType: "GSM_SERVICE_ORDER",
        referenceId: String(createdOrder.id),
      });

      return { order: createdOrder, existing: false };
    });

    if (!order.existing && service.externalId) {
      // Send to the provider after responding, so the customer is not kept waiting.
      after(() => submitOrderToProvider(order.order.id));
    }

    return NextResponse.json(
      { id: order.order.id, existing: order.existing },
      { status: order.existing ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof InsufficientBalanceError) {
      return NextResponse.json({ error: t("err.balance") }, { status: 400 });
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
      { error: t("err.serviceFailed") },
      { status: 500 },
    );
  }
}
