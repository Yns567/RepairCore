import Link from "next/link";
import { Mail, Phone, Wrench } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#070d18] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.15fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600">
              <Wrench size={19} />
            </span>
            <span className="font-extrabold tracking-tight">REPAIRCORE</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
            Tools, spare parts and licensed software solutions for mobile repair technicians.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Shop</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <Link href="/store?category=programmers" className="hover:text-blue-400">Programmers</Link>
            <Link href="/store?category=boxes" className="hover:text-blue-400">Boxes &amp; Dongles</Link>
            <Link href="/store?category=tools" className="hover:text-blue-400">Repair Tools</Link>
            <Link href="/software" className="hover:text-blue-400">Software subscriptions</Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">GSM services</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <Link href="/services?category=IMEI" className="hover:text-blue-400">IMEI checks</Link>
            <Link href="/services?category=SERVER_CREDIT" className="hover:text-blue-400">Tool credits</Link>
            <Link href="/services?category=TOOL_RENTAL" className="hover:text-blue-400">Tool rental</Link>
            <Link href="/account/services" className="hover:text-blue-400">My service orders</Link>
            <Link href="/image-credits" className="hover:text-blue-400">Image credits</Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Contact us</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <a href="tel:0638116689" className="inline-flex items-center gap-2 hover:text-blue-400">
              <Phone size={16} className="text-blue-400" /> 0638116689
            </a>
            <a href="mailto:Achrafgamer50006@gmail.com" className="inline-flex items-center gap-2 break-all hover:text-blue-400">
              <Mail size={16} className="shrink-0 text-blue-400" /> Achrafgamer50006@gmail.com
            </a>
            <Link href="/contact" className="mt-1 font-medium text-blue-400 hover:text-blue-300">Open contact page →</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} RepairCore. All rights reserved.
      </div>
    </footer>
  );
}
