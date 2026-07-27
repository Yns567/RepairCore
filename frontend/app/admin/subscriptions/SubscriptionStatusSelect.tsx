"use client";

import { useTransition } from "react";
import { updateSubscriptionStatus } from "./actions";

const statuses = ["PENDING", "ACTIVE", "CANCELLED", "EXPIRED"];

export default function SubscriptionStatusSelect({ id, status }: { id: number; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(event) => startTransition(async () => { await updateSubscriptionStatus(id, event.target.value); })}
      className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-800"
    >
      {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
    </select>
  );
}
