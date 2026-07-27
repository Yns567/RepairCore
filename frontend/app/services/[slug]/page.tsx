import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, ShieldCheck, WalletCards } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getGsmServiceCategory } from "@/lib/gsm-services";
import ServiceOrderForm from "@/components/services/ServiceOrderForm";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.gsmService.findUnique({ where: { slug } });
  if (!service || service.status !== "ACTIVE") notFound();
  const category = getGsmServiceCategory(service.category);

  return (
    <main className="min-h-screen bg-[#070d18] px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <Link href="/services" className="text-sm font-medium text-blue-400 hover:text-blue-300">← Back to all services</Link>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_26rem]">
          <section>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">{category?.label ?? service.category}</span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white md:text-4xl">{service.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">{service.description}</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <Info icon={<Clock3 size={19} />} label="Processing time" value={service.estimatedTime} />
              <Info icon={<WalletCards size={19} />} label="Payment" value="Store balance" />
              <Info icon={<ShieldCheck size={19} />} label="Order protection" value="Tracked & refundable" />
            </div>
            <div className="mt-8 rounded-xl border border-slate-800 bg-[#0b1220] p-5 text-sm leading-6 text-slate-400">
              <p className="font-semibold text-white">Before placing your order</p>
              <ul className="mt-3 list-disc space-y-2 pl-5"><li>Double-check the IMEI or account username; incorrect details can delay processing.</li><li>Your balance is charged when the order is created.</li><li>If RepairCore rejects or cancels an unprocessed order, the amount is returned to your balance automatically.</li></ul>
            </div>
          </section>
          <aside className="h-fit rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-xl">
            <div className="flex items-end justify-between border-b border-slate-800 pb-5"><div><p className="text-xs uppercase tracking-wider text-slate-500">Total</p><p className="mt-1 text-3xl font-extrabold text-white">${service.price.toString()}</p></div><p className="text-xs text-slate-400">{service.provider}</p></div>
            <div className="mt-5"><ServiceOrderForm serviceId={service.id} slug={service.slug} inputType={service.inputType} price={service.price.toString()} /></div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4"><div className="text-blue-400">{icon}</div><p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p></div>;
}
