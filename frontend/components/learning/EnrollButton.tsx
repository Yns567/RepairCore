"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";

export default function EnrollButton({
  courseId,
  isEnrolled,
  price,
}: {
  courseId: number;
  isEnrolled: boolean;
  price: string;
}) {
  const { t } = useT();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isPaid = Number(price) > 0;

  if (isEnrolled) {
    return (
      <span className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white">
        {t("enroll.enrolled")}
      </span>
    );
  }

  function handleClick() {
    if (isPaid && !confirm(t("enroll.confirm", { price }))) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? t("err.enrollFailed"));
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-700"
      >
        {isPending ? t("enroll.enrolling") : isPaid ? t("enroll.paid", { price }) : t("enroll.free")}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}{" "}
          {mentionsBalance(error) && <Link href="/account/wallet/top-up" className="underline">{t("enroll.topUp")}</Link>}
        </p>
      )}
    </div>
  );
}

function mentionsBalance(message: string) {
  return message.toLowerCase().includes("balance");
}
