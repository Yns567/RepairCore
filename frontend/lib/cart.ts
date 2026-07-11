import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const cartCookieName = "repaircore_cart";
const thirtyDays = 60 * 60 * 24 * 30;

export async function getCart() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(cartCookieName)?.value;

  if (!sessionId) {
    return null;
  }

  return prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getOrCreateCart() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(cartCookieName)?.value;

  if (sessionId) {
    const cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (cart) {
      return cart;
    }
  }

  const newSessionId = crypto.randomUUID();
  const cart = await prisma.cart.create({
    data: { sessionId: newSessionId },
  });

  cookieStore.set(cartCookieName, newSessionId, {
    httpOnly: true,
    maxAge: thirtyDays,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return cart;
}

export function getCartItemCount(
  cart: Awaited<ReturnType<typeof getCart>>,
) {
  return cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}
