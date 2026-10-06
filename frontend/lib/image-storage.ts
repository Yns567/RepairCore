import "server-only";

import { Storage } from "@google-cloud/storage";
import { del as deleteVercelBlob, put as putVercelBlob } from "@vercel/blob";

// Product images live in Google Cloud Storage when GCS_BUCKET is set (Cloud Run
// authenticates through its service account). Vercel Blob remains a fallback so
// images uploaded before the migration keep working.

const gcsBucketName = process.env.GCS_BUCKET;
let storage: Storage | null = null;

function bucket() {
  storage ??= new Storage();
  return storage.bucket(gcsBucketName!);
}

export function hasImageStorage() {
  return Boolean(gcsBucketName || process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function putImage(
  objectPath: string,
  contents: Buffer,
  options: { contentType: string; maximumSizeInBytes: number },
) {
  if (gcsBucketName) {
    if (contents.byteLength > options.maximumSizeInBytes) {
      throw new Error("Image is too large.");
    }
    // Same random-suffix behaviour as Vercel Blob so names never collide.
    const dot = objectPath.lastIndexOf(".");
    const pathname = `${objectPath.slice(0, dot)}-${crypto.randomUUID().slice(0, 8)}${objectPath.slice(dot)}`;
    await bucket().file(pathname).save(contents, {
      contentType: options.contentType,
      resumable: false,
      preconditionOpts: { ifGenerationMatch: 0 },
      metadata: { cacheControl: "public, max-age=31536000, immutable" },
    });
    return { url: `https://storage.googleapis.com/${gcsBucketName}/${pathname}`, pathname };
  }

  const blob = await putVercelBlob(objectPath, contents, {
    access: "public",
    addRandomSuffix: true,
    allowOverwrite: false,
    cacheControlMaxAge: 365 * 24 * 60 * 60,
    contentType: options.contentType,
    maximumSizeInBytes: options.maximumSizeInBytes,
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteImage(pathname: string) {
  if (gcsBucketName) {
    await bucket().file(pathname).delete({ ignoreNotFound: true });
    return;
  }
  await deleteVercelBlob(pathname);
}
