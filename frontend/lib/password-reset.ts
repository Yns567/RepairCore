import "server-only";

import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { emailHtml, sendEmail, siteUrl } from "@/lib/email";
import { prisma } from "@/lib/prisma";

// Reset tokens reuse Auth.js's VerificationToken table. Only a SHA-256 hash of the
// token is stored, so a database leak cannot be used to reset passwords.
const TOKEN_TTL_MS = 30 * 60 * 1000;
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

const identifierFor = (email: string) => `password-reset:${email}`;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Sends a reset link if the account exists. Callers must not reveal whether it does. */
export async function requestPasswordReset(rawEmail: string) {
  const email = normalizeEmail(rawEmail);
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, hashedPassword: true } });
  if (!user?.hashedPassword) return;

  const identifier = identifierFor(email);
  const latest = await prisma.verificationToken.findFirst({
    where: { identifier },
    orderBy: { expires: "desc" },
  });
  // A token issued less than the cooldown ago still has more than TTL - cooldown left.
  if (latest && latest.expires.getTime() > Date.now() + TOKEN_TTL_MS - RESEND_COOLDOWN_MS) return;

  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({
      data: { identifier, token: hashToken(token), expires: new Date(Date.now() + TOKEN_TTL_MS) },
    }),
  ]);

  const url = `${siteUrl()}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
  await sendEmail({
    to: email,
    subject: "Reset your RepairCore password",
    text: `Open this link within 30 minutes to choose a new password:\n${url}\n\nIf you did not ask for this, ignore this email.`,
    html: emailHtml(
      ["We received a request to reset your password. The link is valid for 30 minutes.", "If you did not ask for this, you can ignore this email."],
      { label: "Choose a new password", url },
    ),
  });
}

/** Returns true when the token was valid and the password has been changed. */
export async function resetPassword(rawEmail: string, token: string, newPassword: string) {
  const email = normalizeEmail(rawEmail);
  const identifier = identifierFor(email);
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  return prisma.$transaction(async (tx) => {
    // Deleting the token first makes it single-use even under concurrent requests.
    const consumed = await tx.verificationToken.deleteMany({
      where: { identifier, token: hashToken(token), expires: { gt: new Date() } },
    });
    if (consumed.count !== 1) return false;

    const updated = await tx.user.updateMany({ where: { email }, data: { hashedPassword } });
    await tx.verificationToken.deleteMany({ where: { identifier } });
    await tx.loginThrottle.deleteMany({ where: { key: email } });
    return updated.count === 1;
  });
}
