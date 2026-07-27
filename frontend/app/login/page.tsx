"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
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
      setError("Invalid email or password");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-3xl font-bold text-white">Sign In</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-700"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-400 hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md px-6 py-24 text-slate-400">Loading sign in…</main>}>
      <LoginForm />
    </Suspense>
  );
}
