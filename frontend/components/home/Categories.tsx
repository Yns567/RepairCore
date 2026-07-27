import Link from "next/link";
import { ShoppingBag, Cpu, Wrench, GraduationCap, ArrowRight, Smartphone, Coins, KeyRound } from "lucide-react";

const categories = [
  {
    title: "Store",
    description: "Genuine phone parts, tools and accessories.",
    href: "/store",
    icon: ShoppingBag,
  },
  {
    title: "Software",
    description: "Unlock, flash and repair software — buy or rent.",
    href: "/software",
    icon: Cpu,
  },
  {
    title: "Hardware",
    description: "Boxes, programmers and board-repair equipment.",
    href: "/hardware",
    icon: Wrench,
  },
  {
    title: "Learning",
    description: "Hands-on tutorials and repair courses.",
    href: "/lerning",
    icon: GraduationCap,
  },
  {
    title: "IMEI Checks",
    description: "Device, warranty, blacklist and eligibility checks.",
    href: "/services?category=IMEI",
    icon: Smartphone,
  },
  {
    title: "Tool Credits",
    description: "Credits for supported professional repair tools.",
    href: "/services?category=SERVER_CREDIT",
    icon: Coins,
  },
  {
    title: "Tool Rent",
    description: "Short-term access to professional software tools.",
    href: "/services?category=TOOL_RENTAL",
    icon: KeyRound,
  },
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-500">
            What we offer
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Everything you need, in one place
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

              <h3 className="mt-5 text-lg font-bold text-white">
                {cat.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {cat.description}
              </p>

              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-transform group-hover:translate-x-1">
                Open <ArrowRight size={15} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
