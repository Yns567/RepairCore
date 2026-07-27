"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function EnrollButton({
  courseId,
  isEnrolled,
  price,
}: {
  courseId: number;
  isEnrolled: boolean;
  price: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isPaid = Number(price) > 0;

  if (isEnrolled) {
    return (
      <span className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white">
        You&apos;re enrolled in this course ✓
      </span>
    );
  }

  if (isPaid) {
    return (
      <div>
        <button type="button" disabled className="rounded-lg bg-slate-700 px-6 py-3 font-semibold text-slate-300">
          Paid enrollment coming soon · {price} $
        </button>
        <p className="mt-2 text-sm text-slate-400">Course checkout will be enabled with the payment provider.</p>
      </div>
    );
  }

  function handleClick() {
    startTransition(async () => {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.status === 401) {
        router.push(`/login?next=/lerning`);
        return;
      }

      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-700"
    >
      {isPending
        ? "Enrolling..."
        : "Enroll for Free"}
    </button>
  );
}
