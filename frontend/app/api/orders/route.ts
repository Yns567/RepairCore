import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { type Money, PRICING_CURRENCY, sumLines, toMoney } from "@/lib/money";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { InsufficientBalanceError, debitWallet } from "@/lib/wallet";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  address: z.string().trim().min(8).max(300),
  city: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(["COD", "BALANCE"]).default("COD"),
});

class OrderError extends Error {}

export async function POST(request: Request) {
  const session = await auth();
  const { t } = await getT();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: t("err.signIn") }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: t("err.delivery") }, { status: 400 });
  }

  const cart = await getCart();
  if (!cart) {
    return NextResponse.json({ error: t("err.cartEmpty") }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const items = await tx.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true },
      });

      if (items.length === 0) {
        throw new OrderError(t("err.cartEmpty"));
      }

      const orderItems: { productId: number; quantity: number; unitPrice: Money }[] = [];

      for (const item of items) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            status: "ACTIVE",
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
            version: { increment: 1 },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new OrderError(t("err.stock", { name: item.product.name }));
        }

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: toMoney(item.product.price),
        });
      }

      const total = sumLines(orderItems);

      const created = await tx.order.create({
        data: {
          userId,
          status: parsed.data.paymentMethod === "BALANCE" ? "PAID" : "PENDING",
          paymentMethod: parsed.data.paymentMethod,
          total,
          currency: PRICING_CURRENCY.store,
          fullName: parsed.data.fullName,
          phone: parsed.data.phone,
          address: parsed.data.address,
          city: parsed.data.city,
          notes: parsed.data.notes || null,
          items: { create: orderItems },
        },
        select: { id: true },
      });

      if (parsed.data.paymentMethod === "BALANCE") {
        await debitWallet(tx, {
          userId,
          currency: PRICING_CURRENCY.store,
          amount: total,
          description: `Payment for order #${created.id}`,
          referenceType: "ORDER",
          referenceId: String(created.id),
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    revalidatePath("/", "layout");
    revalidatePath("/cart");
    revalidatePath("/store");
    revalidatePath("/hardware");
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof OrderError
      ? error.message
      : error instanceof InsufficientBalanceError
        ? t("err.balance")
        : t("err.orderFailed");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
