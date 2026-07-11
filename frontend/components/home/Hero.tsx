import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CreditCard, ShieldCheck, Truck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-[#060b14] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(37,99,235,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="pointer-events-none absolute -left-40 top-10 h-[430px] w-[430px] rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-220px] right-[13%] h-[500px] w-[500px] rounded-full bg-blue-500/25 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:min-h-[485px] lg:grid-cols-[.9fr_1.1fr] lg:py-14">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex rounded bg-blue-500/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-blue-300 ring-1 ring-inset ring-blue-400/25">
            Professional Tools
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Professional Tools
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              For Professionals
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
            High-quality tools and programmers for electronics repair. Original products, expert support, and fast shipping for every technician.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/store" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/50 transition hover:bg-blue-500">
              Shop Now <ArrowRight size={17} />
            </Link>
            <Link href="/store" className="rounded-lg border border-slate-600 bg-slate-950/30 px-5 py-3 text-sm font-bold text-white transition hover:border-blue-400 hover:bg-slate-900">
              View Categories
            </Link>
          </div>

          <div className="mt-9 grid max-w-xl grid-cols-1 gap-3 border-t border-slate-700/80 pt-6 sm:grid-cols-3 sm:gap-4">
            <Feature icon={Truck} title="Fast Shipping" text="Worldwide delivery" />
            <Feature icon={ShieldCheck} title="Original Products" text="100% authentic" />
            <Feature icon={CreditCard} title="Secure Payment" text="Safe & secure" />
          </div>
        </div>

        <div className="relative mx-auto h-[290px] w-full max-w-[640px] overflow-hidden rounded-2xl border border-blue-400/20 bg-[#0b1424] shadow-[0_24px_70px_rgba(0,0,0,.55)] sm:h-[355px] lg:h-[420px]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#06101d]/15 via-transparent to-[#06101d]/15" />
          <Image
            src="/images/products/f64.jpg"
            alt="Professional mobile repair tools"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center transition duration-700 hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#050a12] via-[#050a12]/25 to-transparent" />
          <div className="absolute bottom-5 left-5 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur">
            <p className="text-xs font-bold text-white">Tools trusted by technicians</p>
            <p className="mt-0.5 text-[11px] text-blue-300">Repair · Program · Restore</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Truck;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={19} className="shrink-0 text-blue-400" />
      <div>
        <p className="text-xs font-bold text-slate-100">{title}</p>
        <p className="text-[11px] text-slate-400">{text}</p>
      </div>
    </div>
  );
}
