import { PackageCheck, KeySquare, GraduationCap } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";

const points: { icon: typeof PackageCheck; title: MessageKey; description: MessageKey }[] = [
  { icon: PackageCheck, title: "why.partsTitle", description: "why.partsText" },
  { icon: KeySquare, title: "why.softwareTitle", description: "why.softwareText" },
  { icon: GraduationCap, title: "why.learnTitle", description: "why.learnText" },
];

export default async function WhyUs() {
  const { t } = await getT();

  return (
    <section className="border-y border-slate-800 bg-[#0B1220]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-14">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-10">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="flex gap-3 md:gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-800 bg-[#0F1626]">
                  <Icon size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t(point.title)}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-400 md:mt-1.5 md:text-sm">{t(point.description)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
