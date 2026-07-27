import { PackageCheck, KeySquare, GraduationCap } from "lucide-react";

const points = [
  {
    icon: PackageCheck,
    title: "Sourced & verified parts",
    description:
      "Every tool and component is checked before it's listed, so what you order is what you get.",
  },
  {
    icon: KeySquare,
    title: "Instant software access",
    description:
      "Subscribe or rent unlock and flash tools — licenses activate the moment your order clears.",
  },
  {
    icon: GraduationCap,
    title: "Learn while you repair",
    description:
      "Courses built around real bench work, from first teardown to board-level fixes.",
  },
];

export default function WhyUs() {
  return (
    <section className="border-y border-slate-800 bg-[#0B1220]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="flex gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-800 bg-[#0F1626]">
                  <Icon size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
