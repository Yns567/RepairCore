"use server";

import { z } from "zod";
import { requestPasswordReset, resetPassword } from "@/lib/password-reset";

export type FormState = { status: "idle" | "success" | "error"; message?: string };

export async function requestResetAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = z.string().trim().email().max(254).safeParse(formData.get("email"));
  if (!email.success) return { status: "error", message: "Enter a valid email address." };

  try {
    await requestPasswordReset(email.data);
  } catch (error) {
    console.error("Password reset request failed.", String(error));
    return { status: "error", message: "We could not send the email right now. Please try again later." };
  }
  // Same answer whether or not the account exists.
  return { status: "success", message: "If an account exists for this email, a reset link is on its way. Check your inbox and spam folder." };
}

const resetSchema = z
  .object({
    email: z.string().trim().email().max(254),
    token: z.string().min(20).max(200),
    password: z.string().min(8).max(128),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"] });

export async function resetPasswordAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "Use at least 8 characters and type the same password twice." };
  }

  const changed = await resetPassword(parsed.data.email, parsed.data.token, parsed.data.password);
  if (!changed) {
    return { status: "error", message: "This link is invalid or has expired. Request a new one." };
  }
  return { status: "success", message: "Your password has been changed. You can sign in now." };
}
