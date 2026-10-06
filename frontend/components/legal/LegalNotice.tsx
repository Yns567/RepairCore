"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/client";

/** "By continuing you accept our Terms and Refund policy" line for forms. */
export default function LegalNotice() {
  const { t } = useT();
  return (
    <p className="text-xs leading-5 text-slate-500">
      {t("legal.agree")}{" "}
      <Link href="/terms" className="underline hover:text-slate-300">{t("legal.terms")}</Link>{" "}
      {t("legal.and")}{" "}
      <Link href="/refunds" className="underline hover:text-slate-300">{t("legal.refunds")}</Link>.
    </p>
  );
}
