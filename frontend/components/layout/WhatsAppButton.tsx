"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { whatsappLink } from "@/lib/site";

/** Floating support button; sits above the mobile bottom navigation. */
export default function WhatsAppButton() {
  const { t } = useT();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("fab.whatsapp")}
      title={t("fab.whatsapp")}
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] end-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition hover:scale-105 hover:bg-emerald-400 md:bottom-6 md:end-6 md:h-14 md:w-14"
    >
      <MessageCircle size={26} />
    </a>
  );
}
