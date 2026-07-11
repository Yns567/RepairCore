"use server";

import { revalidatePath } from "next/cache";
import { getCart, getCartItemCount, getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

export type CartActionResult = {
  success: boolean;
  message: string;
  itemCount?: number;
};

function isValidId(value: number) {
  return Number.isSafeInteger(value) && value > 0;
}

function refreshCartViews() {
  revalidatePath("/", "layout");
  revalidatePath("/cart");
}

export async function addToCart(
  productId: number,
  quantity = 1,
): Promise<CartActionResult> {
  if (!isValidId(productId) || !Number.isSafeInteger(quantity) || quantity < 1) {
    return { success: false, message: "Invalid product." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || product.status !== "ACTIVE") {
    return { success: false, message: "This product is no longer available." };
  }

  if (product.stock < 1) {
    return { success: false, message: "This product is currently out of stock." };
  }

  const cart = await getOrCreateCart();
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existingItem && existingItem.quantity + quantity > product.stock) {
    return { success: false, message: "You already have the maximum available quantity in your cart." };
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    create: {
      cartId: cart.id,
      productId,
      quantity,
    },
    update: {
      quantity: { increment: quantity },
    },
  });

  const updatedCart = await getCart();
  refreshCartViews();

  return {
    success: true,
    message: `${product.name} was added to your cart.`,
    itemCount: getCartItemCount(updatedCart),
  };
}

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number,
): Promise<CartActionResult> {
  if (!isValidId(cartItemId) || !Number.isSafeInteger(quantity)) {
    return { success: false, message: "Invalid cart update." };
  }

  const cart = await getCart();
  if (!cart) {
    return { success: false, message: "Your cart could not be found." };
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cartId: cart.id },
    include: { product: true },
  });

  if (!item) {
    return { success: false, message: "This cart item could not be found." };
  }

  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    if (item.product.status !== "ACTIVE" || item.product.stock < 1) {
      return { success: false, message: "This product is no longer available." };
    }

    if (quantity > item.product.stock) {
      return { success: false, message: `Only ${item.product.stock} item(s) are available.` };
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }

  const updatedCart = await getCart();
  refreshCartViews();
  return {
    success: true,
    message: "Cart updated.",
    itemCount: getCartItemCount(updatedCart),
  };
}

export async function removeCartItem(cartItemId: number): Promise<CartActionResult> {
  if (!isValidId(cartItemId)) {
    return { success: false, message: "Invalid cart item." };
  }

  const cart = await getCart();
  if (!cart) {
    return { success: false, message: "Your cart could not be found." };
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cartId: cart.id },
  });

  if (!item) {
    return { success: false, message: "This cart item could not be found." };
  }

  await prisma.cartItem.delete({ where: { id: item.id } });
  const updatedCart = await getCart();
  refreshCartViews();

  return {
    success: true,
    message: "Item removed from your cart.",
    itemCount: getCartItemCount(updatedCart),
  };
}
