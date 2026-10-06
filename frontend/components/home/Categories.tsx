import Link from "next/link";
import { ShoppingBag, Cpu, Wrench, GraduationCap, ArrowRight, Smartphone, Coins, KeyRound } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";

const categories: { title: MessageKey; description: MessageKey; href: string; icon: typeof ShoppingBag }[] = [
  { title: "cat.store", description: "cat.storeText", href: "/store", icon: ShoppingBag },
  { title: "cat.software", description: "cat.softwareText", href: "/software", icon: Cpu },
  { title: "cat.hardware", description: "cat.hardwareText", href: "/hardware", icon: Wrench },
  { title: "cat.learning", description: "cat.learningText", href: "/learning", icon: GraduationCap },
  { title: "cat.imei", description: "cat.imeiText", href: "/services?category=IMEI", icon: Smartphone },
  { title: "cat.credits", description: "cat.creditsText", href: "/services?category=SERVER_CREDIT", icon: Coins },
  { title: "cat.rent", description: "cat.rentText", href: "/services?category=TOOL_RENTAL", icon: KeyRound },
];

export default async function Categories() {
  const { t } = await getT();

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-500">
            {t("cat.kicker")}
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t("cat.title")}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-600/60 hover:shadow-xl hover:shadow-blue-950/40"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-800 shadow-[0_0_20px_rgba(37,99,235,.35)]">
                <Icon size={22} className="text-white" strokeWidth={2.2} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-white">{t(cat.title)}</h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">{t(cat.description)}</p>

              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                {t("cat.open")} <ArrowRight size={15} className="rtl:rotate-180" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
