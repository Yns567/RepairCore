"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { type FormState, resetPasswordAction } from "../forgot-password/actions";

const inputClass = "w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500";

function ResetPasswordForm() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const [state, formAction, pending] = useActionState<FormState, FormData>(resetPasswordAction, { status: "idle" });

  if (!email || !token) {
    return (
      <p className="mt-8 text-slate-400">
        This link is incomplete. <Link href="/forgot-password" className="text-blue-400 underline">Request a new one</Link>.
      </p>
    );
  }

  if (state.status === "success") {
    return (
      <div className="mt-8 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200">
        <p>{state.message}</p>
        <Link href="/login" className="mt-3 inline-block font-semibold text-emerald-300 underline">Sign in</Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />
      <p className="text-sm text-slate-400">Account: <span className="text-white">{email}</span></p>
      <input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" placeholder="New password (min. 8 characters)" className={inputClass} />
      <input name="confirm" type="password" required minLength={8} maxLength={128} autoComplete="new-password" placeholder="Repeat new password" className={inputClass} />
      {state.status === "error" && (
        <p className="text-sm text-red-400">
          {state.message} <Link href="/forgot-password" className="underline">New link</Link>
        </p>
      )}
      <button disabled={pending} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-700">
        {pending ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-bold text-white">Choose a new password</h1>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
