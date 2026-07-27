"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  description: z.string().trim().max(3000).optional(),
  price: z.coerce.number().finite().min(0),
  stock: z.coerce.number().int().min(0).max(100000),
  category: z.string().trim().max(80).optional(),
  brand: z.string().trim().max(80).optional(),
  partNumber: z.string().trim().max(100).optional(),
});

function readProductForm(formData: FormData) {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stock: formData.get("stock") || 0,
    category: formData.get("category") || undefined,
    brand: formData.get("brand") || undefined,
    partNumber: formData.get("partNumber") || undefined,
  });

  if (!parsed.success) {
    throw new Error("Please provide valid product details.");
  }

  return parsed.data;
}

async function saveImage(formData: FormData) {
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return null;
  }

  const allowedTypes = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ]);
  const expectedExtension = allowedTypes.get(image.type);
  if (!expectedExtension || image.size > 4 * 1024 * 1024) {
    throw new Error("Upload a JPG, PNG, or WebP image smaller than 4 MB.");
  }

  const contents = Buffer.from(await image.arrayBuffer());
  const detectedExtension = detectImageExtension(contents);
  if (detectedExtension !== expectedExtension) {
    throw new Error("The uploaded file contents do not match its image type.");
  }

  const directory = path.join(process.cwd(), "public", "images", "products");
  const filename = `${Date.now()}-${crypto.randomUUID()}.${detectedExtension}`;

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), contents, { flag: "wx" });
  return `/images/products/${filename}`;
}

function detectImageExtension(contents: Buffer) {
  if (
    contents.length >= 3 &&
    contents[0] === 0xff &&
    contents[1] === 0xd8 &&
    contents[2] === 0xff
  ) {
    return "jpg";
  }

  if (
    contents.length >= 8 &&
    contents.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    return "png";
  }

  if (
    contents.length >= 12 &&
    contents.subarray(0, 4).toString("ascii") === "RIFF" &&
    contents.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

function refreshProductViews(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/store");
  revalidatePath("/hardware");
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = readProductForm(formData);
  const image = await saveImage(formData);

  await prisma.product.create({
    data: {
      ...data,
      description: data.description || null,
      category: data.category || null,
      brand: data.brand || null,
      partNumber: data.partNumber || null,
      image,
      status: "ACTIVE",
    },
  });

  refreshProductViews(data.slug);
  redirect("/admin/products");
}

export async function updateProduct(id: number, formData: FormData) {
  await requireAdmin();
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid product.");

  const data = readProductForm(formData);
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) throw new Error("Product not found.");

  const image = await saveImage(formData);
  await prisma.product.update({
    where: { id },
    data: {
      ...data,
      description: data.description || null,
      category: data.category || null,
      brand: data.brand || null,
      partNumber: data.partNumber || null,
      ...(image ? { image } : {}),
    },
  });

  refreshProductViews(current.slug);
  refreshProductViews(data.slug);
  redirect("/admin/products");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid product.");

  await prisma.product.delete({ where: { id } });
  refreshProductViews();
  redirect("/admin/products");
}
