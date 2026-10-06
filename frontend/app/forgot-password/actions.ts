"use server";

import { z } from "zod";
import { getT } from "@/lib/i18n/server";
import { requestPasswordReset, resetPassword } from "@/lib/password-reset";

export type FormState = { status: "idle" | "success" | "error"; message?: string };

export async function requestResetAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getT();
  const email = z.string().trim().email().max(254).safeParse(formData.get("email"));
  if (!email.success) return { status: "error", message: t("auth.invalidEmail") };

  try {
    await requestPasswordReset(email.data);
  } catch (error) {
    console.error("Password reset request failed.", String(error));
    return { status: "error", message: t("auth.sendFailed") };
  }
  // Same answer whether or not the account exists.
  return { status: "success", message: t("auth.linkSent") };
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
  const { t } = await getT();
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: t("auth.passwordRules") };
  }

  const changed = await resetPassword(parsed.data.email, parsed.data.token, parsed.data.password);
  if (!changed) {
    return { status: "error", message: t("auth.linkInvalid") };
  }
  return { status: "success", message: t("auth.passwordChanged") };
}
