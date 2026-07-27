import type { Metadata } from "next";
import { Mail, MessageCircleMore, Phone, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact RepairCore for products, software subscriptions and rentals.",
};

export default function ContactPage() {
  return (
    <main className="min-h-[calc(100vh-120px)] bg-[#070d18] px-6 py-16">
      <section className="mx-auto max-w-5xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
          <Wrench size={14} /> REPAIRCORE SUPPORT
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          Contact us
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
          Need help choosing a repair tool, software activation or rental? Contact us directly and we will help you find the right solution.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <a
            href="tel:0638116689"
            className="group rounded-2xl border border-slate-800 bg-[#0b1220] p-7 transition hover:-translate-y-1 hover:border-blue-500"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white"><Phone size={22} /></span>
            <h2 className="mt-5 text-xl font-bold text-white">Phone</h2>
            <p className="mt-2 text-sm text-slate-400">Call us for product and order support.</p>
            <p className="mt-5 text-lg font-semibold text-blue-400">0638116689</p>
          </a>

          <a
            href="mailto:Achrafgamer50006@gmail.com"
            className="group rounded-2xl border border-slate-800 bg-[#0b1220] p-7 transition hover:-translate-y-1 hover:border-blue-500"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white"><Mail size={22} /></span>
            <h2 className="mt-5 text-xl font-bold text-white">Email</h2>
            <p className="mt-2 text-sm text-slate-400">Send product, software or rental questions by email.</p>
            <p className="mt-5 break-all text-lg font-semibold text-blue-400">Achrafgamer50006@gmail.com</p>
          </a>
        </div>

        <div className="mt-8 flex gap-3 rounded-2xl border border-slate-800 bg-[#101a2d] p-5 text-sm text-slate-300">
          <MessageCircleMore className="mt-0.5 shrink-0 text-blue-400" size={20} />
          <p>For faster support, include the product or software name and the phone model you are working on.</p>
        </div>
      </section>
    </main>
  );
}
