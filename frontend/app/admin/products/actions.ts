"use server";

import { del, put } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "fs/promises";
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

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
type ImageExtension = "jpg" | "png" | "webp";
type SavedImage = {
  url: string;
  blobPath: string | null;
  localPath: string | null;
};

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

async function saveImage(formData: FormData): Promise<SavedImage | null> {
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return null;
  }

  const allowedTypes = new Map<string, ImageExtension>([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ]);
  const expectedExtension = allowedTypes.get(image.type);
  if (!expectedExtension || image.size > MAX_IMAGE_BYTES) {
    throw new Error("Upload a JPG, PNG, or WebP image smaller than 4 MB.");
  }

  const contents = Buffer.from(await image.arrayBuffer());
  const detectedExtension = detectImageExtension(contents);
  if (detectedExtension !== expectedExtension) {
    throw new Error("The uploaded file contents do not match its image type.");
  }

  const filename = `${crypto.randomUUID()}.${detectedExtension}`;

  if (hasBlobStoreConfiguration()) {
    const contentTypes: Record<ImageExtension, string> = {
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    const blob = await put(`product-images/${filename}`, contents, {
      access: "public",
      addRandomSuffix: true,
      allowOverwrite: false,
      cacheControlMaxAge: 365 * 24 * 60 * 60,
      contentType: contentTypes[detectedExtension],
      maximumSizeInBytes: MAX_IMAGE_BYTES,
    });

    return { url: blob.url, blobPath: blob.pathname, localPath: null };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Product image storage is not configured for this deployment.",
    );
  }

  const directory = path.join(process.cwd(), "public", "images", "products");
  const localPath = path.join(directory, filename);
  await mkdir(directory, { recursive: true });
  await writeFile(localPath, contents, { flag: "wx" });
  return {
    url: `/images/products/${filename}`,
    blobPath: null,
    localPath,
  };
}

function hasBlobStoreConfiguration() {
  // In Vercel Functions, OIDC arrives through the request context rather than
  // process.env. The Blob SDK reads it automatically once a store ID exists.
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

async function deleteBlobImage(blobPath: string | null | undefined) {
  if (!blobPath || !hasBlobStoreConfiguration()) return;
  if (!blobPath.startsWith("product-images/") || blobPath.includes("..")) {
    console.error("Refused to delete an unexpected Blob pathname.", {
      blobPath,
    });
    return;
  }

  try {
    await del(blobPath);
  } catch {
    // The database change has already succeeded. A later cleanup can safely
    // remove this orphan without making the administrator repeat the action.
    console.error("Unable to remove an unused product image from Blob storage.", {
      blobPath,
    });
  }
}

async function deleteNewImage(savedImage: SavedImage | null) {
  if (!savedImage) return;

  if (savedImage.blobPath) {
    await deleteBlobImage(savedImage.blobPath);
    return;
  }

  if (savedImage.localPath) {
    try {
      await unlink(savedImage.localPath);
    } catch {
      console.error("Unable to remove an unused local product image.");
    }
  }
}

function detectImageExtension(contents: Buffer): ImageExtension | null {
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
  const savedImage = await saveImage(formData);

  try {
    await prisma.product.create({
      data: {
        ...data,
        description: data.description || null,
        category: data.category || null,
        brand: data.brand || null,
        partNumber: data.partNumber || null,
        image: savedImage?.url ?? null,
        imageBlobPath: savedImage?.blobPath ?? null,
        status: "ACTIVE",
      },
    });
  } catch (error) {
    await deleteNewImage(savedImage);
    throw error;
  }

  refreshProductViews(data.slug);
  redirect("/admin/products");
}

export async function updateProduct(
  id: number,
  expectedVersion: number,
  formData: FormData,
) {
  await requireAdmin();
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid product.");
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0) {
    throw new Error("Invalid product version.");
  }

  const data = readProductForm(formData);
  const current = await prisma.product.findFirst({
    where: { id, version: expectedVersion },
    select: { imageBlobPath: true, slug: true, version: true },
  });
  if (!current) {
    throw new Error(
      "This product changed in another session. Refresh the page and try again.",
    );
  }

  const savedImage = await saveImage(formData);

  try {
    const result = await prisma.product.updateMany({
      where: { id, version: expectedVersion },
      data: {
        ...data,
        description: data.description || null,
        category: data.category || null,
        brand: data.brand || null,
        partNumber: data.partNumber || null,
        ...(savedImage
          ? {
              image: savedImage.url,
              imageBlobPath: savedImage.blobPath,
            }
          : {}),
        version: { increment: 1 },
      },
    });

    if (result.count !== 1) {
      throw new Error(
        "This product changed in another session. Refresh the page and try again.",
      );
    }
  } catch (error) {
    await deleteNewImage(savedImage);
    throw error;
  }

  if (savedImage) {
    await deleteBlobImage(current.imageBlobPath);
  }

  refreshProductViews(current.slug);
  refreshProductViews(data.slug);
  redirect("/admin/products");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid product.");

  const deleted = await prisma.product.delete({
    where: { id },
    select: { imageBlobPath: true, slug: true },
  });
  await deleteBlobImage(deleted.imageBlobPath);

  refreshProductViews(deleted.slug);
  redirect("/admin/products");
}
