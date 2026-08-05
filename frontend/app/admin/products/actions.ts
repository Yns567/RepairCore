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
const IMAGE_FIELD_NAMES = ["image", "image2", "image3"] as const;
const REMOVE_IMAGE_FIELD_NAMES = [
  "removeImage",
  "removeImage2",
  "removeImage3",
] as const;
type ImageExtension = "jpg" | "png" | "webp";
type SavedImage = {
  url: string;
  blobPath: string | null;
  localPath: string | null;
};
type StoredImage = Pick<SavedImage, "url" | "blobPath">;
type SavedImageSlots = [
  SavedImage | null,
  SavedImage | null,
  SavedImage | null,
];
type StoredImageSlots = [
  StoredImage | null,
  StoredImage | null,
  StoredImage | null,
];

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

async function saveImage(image: FormDataEntryValue | null): Promise<SavedImage | null> {
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
    throw new Error("Upload a JPG, PNG, or WebP image no larger than 4 MB.");
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

async function saveProductImages(formData: FormData): Promise<SavedImageSlots> {
  const entries = IMAGE_FIELD_NAMES.map((fieldName) => formData.get(fieldName));
  const totalBytes = entries.reduce(
    (total, entry) =>
      total + (entry instanceof File && entry.size > 0 ? entry.size : 0),
    0,
  );

  if (totalBytes > MAX_IMAGE_BYTES) {
    throw new Error(
      "The combined size of newly selected product images must not exceed 4 MB.",
    );
  }

  const savedImages: SavedImageSlots = [null, null, null];
  try {
    for (let index = 0; index < entries.length; index += 1) {
      savedImages[index] = await saveImage(entries[index]);
    }
    return savedImages;
  } catch (error) {
    await deleteNewImages(savedImages);
    throw error;
  }
}

function hasBlobStoreConfiguration() {
  // In Vercel Functions, OIDC arrives through the request context rather than
  // process.env. The Blob SDK reads it automatically once a store ID exists.
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

function isManagedBlobPath(blobPath: string) {
  return blobPath.startsWith("product-images/") && !blobPath.includes("..");
}

function assertBlobCleanupAvailable(
  blobPaths: readonly (string | null | undefined)[],
) {
  const pathsToDelete = blobPaths.filter(
    (blobPath): blobPath is string => Boolean(blobPath),
  );
  if (pathsToDelete.length === 0) return;

  if (!hasBlobStoreConfiguration()) {
    throw new Error(
      "Product image storage is not configured, so the existing image was not removed.",
    );
  }

  if (pathsToDelete.some((blobPath) => !isManagedBlobPath(blobPath))) {
    throw new Error(
      "This product contains an invalid stored image reference. The image was not removed.",
    );
  }
}

async function deleteBlobImage(blobPath: string | null | undefined) {
  if (!blobPath || !hasBlobStoreConfiguration()) return;
  if (!isManagedBlobPath(blobPath)) {
    console.error("Refused to delete an unexpected Blob pathname.", {
      blobPath,
    });
    return;
  }

  try {
    const stillReferenced = await prisma.product.findFirst({
      where: {
        OR: [
          { imageBlobPath: blobPath },
          { image2BlobPath: blobPath },
          { image3BlobPath: blobPath },
        ],
      },
      select: { id: true },
    });
    if (stillReferenced) {
      console.warn("Kept a product image that is still referenced.", {
        blobPath,
        productId: stillReferenced.id,
      });
      return;
    }

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

async function deleteNewImages(savedImages: readonly (SavedImage | null)[]) {
  for (const savedImage of savedImages) {
    await deleteNewImage(savedImage);
  }
}

function compactImageSlots(
  images: readonly (StoredImage | null)[],
): StoredImageSlots {
  const compacted = images.filter(
    (image): image is StoredImage => Boolean(image?.url),
  );
  return [compacted[0] ?? null, compacted[1] ?? null, compacted[2] ?? null];
}

function imageSlotData(images: StoredImageSlots) {
  return {
    image: images[0]?.url ?? null,
    imageBlobPath: images[0]?.blobPath ?? null,
    image2: images[1]?.url ?? null,
    image2BlobPath: images[1]?.blobPath ?? null,
    image3: images[2]?.url ?? null,
    image3BlobPath: images[2]?.blobPath ?? null,
  };
}

function readImageRemovalFlags(formData: FormData) {
  return REMOVE_IMAGE_FIELD_NAMES.map(
    (fieldName) => formData.get(fieldName) === "on",
  );
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
  const savedImages = await saveProductImages(formData);
  const images = compactImageSlots(savedImages);

  try {
    await prisma.product.create({
      data: {
        ...data,
        description: data.description || null,
        category: data.category || null,
        brand: data.brand || null,
        partNumber: data.partNumber || null,
        ...imageSlotData(images),
        status: "ACTIVE",
      },
    });
  } catch (error) {
    await deleteNewImages(savedImages);
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
    select: {
      image: true,
      imageBlobPath: true,
      image2: true,
      image2BlobPath: true,
      image3: true,
      image3BlobPath: true,
      slug: true,
    },
  });
  if (!current) {
    throw new Error(
      "This product changed in another session. Refresh the page and try again.",
    );
  }

  const savedImages = await saveProductImages(formData);
  const removalFlags = readImageRemovalFlags(formData);
  const currentImages: StoredImageSlots = [
    current.image
      ? { url: current.image, blobPath: current.imageBlobPath }
      : null,
    current.image2
      ? { url: current.image2, blobPath: current.image2BlobPath }
      : null,
    current.image3
      ? { url: current.image3, blobPath: current.image3BlobPath }
      : null,
  ];
  const requestedImages = currentImages.map((currentImage, index) => {
    const replacement = savedImages[index];
    if (replacement) {
      return { url: replacement.url, blobPath: replacement.blobPath };
    }
    return removalFlags[index] ? null : currentImage;
  });
  const finalImages = compactImageSlots(requestedImages);
  const retainedBlobPaths = new Set(
    finalImages.flatMap((image) => (image?.blobPath ? [image.blobPath] : [])),
  );
  const replacedBlobPaths = currentImages.flatMap((image) =>
    image?.blobPath && !retainedBlobPaths.has(image.blobPath)
      ? [image.blobPath]
      : [],
  );

  try {
    assertBlobCleanupAvailable(replacedBlobPaths);

    const result = await prisma.product.updateMany({
      where: { id, version: expectedVersion },
      data: {
        ...data,
        description: data.description || null,
        category: data.category || null,
        brand: data.brand || null,
        partNumber: data.partNumber || null,
        ...imageSlotData(finalImages),
        version: { increment: 1 },
      },
    });

    if (result.count !== 1) {
      throw new Error(
        "This product changed in another session. Refresh the page and try again.",
      );
    }
  } catch (error) {
    await deleteNewImages(savedImages);
    throw error;
  }

  for (const blobPath of replacedBlobPaths) {
    await deleteBlobImage(blobPath);
  }

  refreshProductViews(current.slug);
  refreshProductViews(data.slug);
  redirect("/admin/products");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid product.");

  const current = await prisma.product.findUnique({
    where: { id },
    select: {
      imageBlobPath: true,
      image2BlobPath: true,
      image3BlobPath: true,
      slug: true,
      version: true,
    },
  });
  if (!current) throw new Error("Product not found.");

  const blobPaths = [
    current.imageBlobPath,
    current.image2BlobPath,
    current.image3BlobPath,
  ];
  assertBlobCleanupAvailable(blobPaths);

  const deleted = await prisma.product.deleteMany({
    where: { id, version: current.version },
  });
  if (deleted.count !== 1) {
    throw new Error(
      "This product changed in another session. Refresh the page and try again.",
    );
  }

  for (const blobPath of blobPaths) {
    await deleteBlobImage(blobPath);
  }

  refreshProductViews(current.slug);
  redirect("/admin/products");
}
