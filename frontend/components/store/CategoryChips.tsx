import Link from "next/link";

export type Chip = { href: string; label: string; active: boolean };

/** One horizontally scrollable row of filter chips (wrapping wastes space on phones). */
export default function CategoryChips({ chips, className = "" }: { chips: Chip[]; className?: string }) {
  return (
    <nav className={`no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0 ${className}`}>
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          aria-current={chip.active ? "page" : undefined}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
            chip.active
              ? "bg-blue-600 text-white shadow shadow-blue-900/40"
              : "border border-slate-700 bg-[#0b1220] text-slate-300 hover:border-blue-500 hover:text-white"
          }`}
        >
          {chip.label}
        </Link>
      ))}
    </nav>
  );
}
