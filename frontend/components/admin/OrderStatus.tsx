"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/orders/actions";

type Props = {
  orderId: number;
  status: string;
};

export default function OrderStatus({
  orderId,
  status,
}: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          await updateOrderStatus(
            orderId,
            e.target.value,
          );
        })
      }
      className="rounded-lg border border-slate-700 bg-slate-900 p-2"
    >
      <option value="PENDING">Pending</option>
      <option value="PROCESSING">Processing</option>
      <option value="SHIPPED">Shipped</option>
      <option value="COMPLETED">Completed</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  );
}