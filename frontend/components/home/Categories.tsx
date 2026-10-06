import Link from "next/link";
import { ShoppingBag, Cpu, Wrench, GraduationCap, ArrowRight, Smartphone, Coins, KeyRound } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";

const categories: { title: MessageKey; description: MessageKey; href: string; icon: typeof ShoppingBag }[] = [
  { title: "cat.store", description: "cat.storeText", href: "/store", icon: ShoppingBag },
  { title: "cat.imei", description: "cat.imeiText", href: "/services?category=IMEI", icon: Smartphone },
  { title: "cat.credits", description: "cat.creditsText", href: "/services?category=SERVER_CREDIT", icon: Coins },
  { title: "cat.rent", description: "cat.rentText", href: "/services?category=TOOL_RENTAL", icon: KeyRound },
  { title: "cat.software", description: "cat.softwareText", href: "/software", icon: Cpu },
  { title: "cat.hardware", description: "cat.hardwareText", href: "/store?category=boxes", icon: Wrench },
  { title: "cat.learning", description: "cat.learningText", href: "/learning", icon: GraduationCap },
];

/** Quick access: app-like icon tiles on phones, descriptive cards from `sm` up. */
export default async function Categories() {
  const { t } = await getT();

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-14">
      <div className="mb-4 md:mb-8">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-500 sm:text-xs">{t("cat.kicker")}</span>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:mt-2 md:text-3xl">{t("cat.title")}</h2>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-[#0B1220] p-2.5 text-center transition hover:border-blue-600/60 sm:items-start sm:p-5 sm:text-start md:hover:-translate-y-0.5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-800 shadow-[0_0_16px_rgba(37,99,235,.3)] sm:h-12 sm:w-12">
                <Icon size={21} className="text-white" strokeWidth={2.2} />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-white sm:mt-2 sm:text-base sm:font-bold">{t(cat.title)}</span>
              <span className="hidden text-sm leading-relaxed text-slate-400 sm:block">{t(cat.description)}</span>
              <span className="mt-auto hidden items-center gap-1.5 pt-2 text-sm font-medium text-blue-400 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 sm:inline-flex">
                {t("cat.open")} <ArrowRight size={15} className="rtl:rotate-180" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
