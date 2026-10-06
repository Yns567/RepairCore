"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { setLocale } from "@/app/actions/locale";
import { LOCALE_NAMES, LOCALES } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/client";

export default function LanguageSwitcher({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const { t, locale } = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const small = size === "sm";

  return (
    <label className={`flex items-center gap-1.5 font-medium text-slate-200 ${className}`}>
      <Languages size={small ? 13 : 16} className="text-slate-400" aria-hidden />
      <span className="sr-only">{t("nav.language")}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value;
          startTransition(async () => {
            await setLocale(next);
            router.refresh();
          });
        }}
        className={`cursor-pointer rounded-md border border-slate-700 bg-[#121a27] text-white outline-none focus:border-blue-500 ${small ? "px-1.5 py-0.5 text-[11px] sm:text-xs" : "px-2 py-1 text-sm"}`}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>{LOCALE_NAMES[code]}</option>
        ))}
      </select>
    </label>
  );
}
