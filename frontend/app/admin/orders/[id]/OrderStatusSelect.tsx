"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "../actions";

const statuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: number;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value;
    if (status === "CANCELLED" && !confirm("Cancel this order? Stock is restored and balance payments are refunded. This cannot be undone.")) {
      e.target.value = currentStatus;
      return;
    }
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, status);
      } catch (error) {
        e.target.value = currentStatus;
        alert(error instanceof Error ? error.message : "Could not update the order.");
      }
    });
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
