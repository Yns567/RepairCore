"use server";

import { revalidatePath } from "next/cache";
import { getCart, getCartItemCount, getOrCreateCart } from "@/lib/cart";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export type CartActionResult = {
  success: boolean;
  message: string;
  itemCount?: number;
};

function isPositiveInteger(value: number) {
  return Number.isSafeInteger(value) && value > 0;
}

function refreshCart() {
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  revalidatePath("/store");
  revalidatePath("/hardware");
}

export async function addToCart(
  productId: number,
  quantity = 1,
): Promise<CartActionResult> {
  const { t } = await getT();
  if (!isPositiveInteger(productId) || !isPositiveInteger(quantity)) {
    return { success: false, message: t("cartMsg.invalidQuantity") };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") {
    return { success: false, message: t("cartMsg.unavailable") };
  }

  if (product.stock < quantity) {
    return { success: false, message: t("cartMsg.notEnough") };
  }

  const cart = await getOrCreateCart();
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem && existingItem.quantity + quantity > product.stock) {
    return { success: false, message: t("cartMsg.max") };
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity: { increment: quantity } },
  });

  const updatedCart = await getCart();
  refreshCart();

  return {
    success: true,
    message: t("cartMsg.added", { name: product.name }),
    itemCount: getCartItemCount(updatedCart),
  };
}

export async function updateCartItemQuantity(
  itemId: number,
  quantity: number,
): Promise<CartActionResult> {
  const { t } = await getT();
  if (!isPositiveInteger(itemId) || !Number.isSafeInteger(quantity)) {
    return { success: false, message: t("cartMsg.invalidUpdate") };
  }

  const cart = await getCart();
  if (!cart) {
    return { success: false, message: t("cartMsg.noCart") };
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: true },
  });
  if (!item) {
    return { success: false, message: t("cartMsg.noItem") };
  }

  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    if (item.product.status !== "ACTIVE" || item.product.stock < quantity) {
      return { success: false, message: t("cartMsg.notEnough") };
    }

    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  }

  const updatedCart = await getCart();
  refreshCart();
  return { success: true, message: t("cartMsg.updated"), itemCount: getCartItemCount(updatedCart) };
}

export async function removeFromCart(itemId: number): Promise<CartActionResult> {
  const { t } = await getT();
  if (!isPositiveInteger(itemId)) {
    return { success: false, message: t("cartMsg.invalidItem") };
  }

  const cart = await getCart();
  if (!cart) {
    return { success: false, message: t("cartMsg.noCart") };
  }

  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) {
    return { success: false, message: t("cartMsg.noItem") };
  }

  await prisma.cartItem.delete({ where: { id: item.id } });
  const updatedCart = await getCart();
  refreshCart();
  return { success: true, message: t("cartMsg.removed"), itemCount: getCartItemCount(updatedCart) };
}
