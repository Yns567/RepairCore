"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";

const options: { value: string; label: MessageKey }[] = [
  { value: "new", label: "sort.new" },
  { value: "price-low", label: "sort.priceLow" },
  { value: "price-high", label: "sort.priceHigh" },
  { value: "name", label: "sort.name" },
];

/** Changes the `sort` query parameter while keeping category, brand and search. */
export default function SortSelect({ path = "/store" }: { path?: string }) {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "new";

  return (
    <label className="flex items-center gap-2 text-xs text-slate-400">
      <ArrowUpDown size={14} aria-hidden />
      <span className="sr-only">{t("store.sort")}</span>
      <select
        value={current}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", event.target.value);
          router.push(`${path}?${params.toString()}`);
        }}
        className="rounded-lg border border-slate-700 bg-[#0b1220] px-2.5 py-1.5 text-xs font-medium text-white outline-none focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{t(option.label)}</option>
        ))}
      </select>
    </label>
  );
}
