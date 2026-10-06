"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { setLocale } from "@/app/actions/locale";
import { LOCALE_NAMES, LOCALES } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/client";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { t, locale } = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className={`flex items-center gap-1.5 font-medium text-slate-200 ${className}`}>
      <Languages size={16} className="text-slate-400" aria-hidden />
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
        className="cursor-pointer rounded-md border border-slate-700 bg-[#121a27] px-2 py-1 text-sm text-white outline-none focus:border-blue-500"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>{LOCALE_NAMES[code]}</option>
        ))}
      </select>
    </label>
  );
}
