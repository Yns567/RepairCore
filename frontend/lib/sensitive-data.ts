import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const FORMAT_VERSION = "v1";
const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const configuredKey = process.env.DATA_ENCRYPTION_KEY;

  if (configuredKey) {
    const decoded = Buffer.from(configuredKey, "base64");
    if (decoded.length !== 32) {
      throw new Error("DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
    }
    return decoded;
  }

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    throw new Error("DATA_ENCRYPTION_KEY is required to protect sensitive service data.");
  }

  // Keeps existing local installations working while production can use a
  // dedicated, independently rotatable data-encryption key.
  return createHash("sha256").update(authSecret).digest();
}

export function encryptSensitiveValue(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    FORMAT_VERSION,
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    tag.toString("base64url"),
  ].join(":");
}

export function decryptSensitiveValue(value: string) {
  if (!value.startsWith(`${FORMAT_VERSION}:`)) {
    // Backward-compatible read for orders created before encryption was added.
    return value;
  }

  const [, ivValue, encryptedValue, tagValue] = value.split(":");
  if (!ivValue || !encryptedValue || !tagValue) {
    throw new Error("Invalid encrypted value.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function maskSensitiveValue(value: string, visibleCharacters = 4) {
  const visible = Math.max(0, Math.min(visibleCharacters, value.length));
  return `${"•".repeat(Math.max(0, value.length - visible))}${value.slice(-visible)}`;
}
