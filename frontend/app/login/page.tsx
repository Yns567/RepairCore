"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";

const inputClass = "w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500";

function LoginForm() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  // NextAuth's middleware redirects unauthenticated visitors to
  // `/login?callbackUrl=/admin/...`, so we must read "callbackUrl" first.
  // "next" is kept as a fallback in case something links here with that name.
  const next =
    searchParams.get("callbackUrl") || searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(t("auth.invalid"));
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 sm:px-6 py-8 md:py-16">
      <h1 className="text-2xl font-bold md:text-3xl text-white">{t("auth.signIn")}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={inputClass} />
        <input type="password" placeholder={t("auth.password")} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className={inputClass} />

        <p className="text-end text-sm">
          <Link href="/forgot-password" className="text-blue-400 hover:underline">{t("auth.forgot")}</Link>
        </p>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-700"
        >
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="text-blue-400 hover:underline">{t("auth.createOne")}</Link>
      </p>
    </main>
  );
}

function Loading() {
  const { t } = useT();
  return <main className="mx-auto w-full max-w-md px-4 sm:px-6 py-8 md:py-16 text-slate-400">{t("auth.loading")}</main>;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}
