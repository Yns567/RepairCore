"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useT } from "@/lib/i18n/client";
import { type FormState, requestResetAction } from "./actions";

export default function ForgotPasswordPage() {
  const { t } = useT();
  const [state, formAction, pending] = useActionState<FormState, FormData>(requestResetAction, { status: "idle" });

  return (
    <main className="mx-auto w-full max-w-md px-4 sm:px-6 py-6 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl text-white">{t("auth.forgotTitle")}</h1>
      <p className="mt-2 text-slate-400">{t("auth.forgotText")}</p>

      {state.status === "success" ? (
        <p className="mt-8 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200">{state.message}</p>
      ) : (
        <form action={formAction} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder={t("auth.email")}
            className="w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500"
          />
          {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
          <button disabled={pending} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-700">
            {pending ? t("auth.sending") : t("auth.sendLink")}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/login" className="text-blue-400 hover:underline">{t("auth.backToSignIn")}</Link>
      </p>
    </main>
  );
}
