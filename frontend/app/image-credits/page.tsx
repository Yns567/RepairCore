import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product Image Credits",
  description: "Attribution and license information for product photography used by RepairCore.",
};

const imageCredits = [
  {
    product: "Digital Repair Microscope",
    author: "Ravi312",
    source: "https://commons.wikimedia.org/wiki/File:Digital_USB_microscope.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    product: "Precision Screwdriver Set",
    author: "oomlout",
    source: "https://commons.wikimedia.org/wiki/File:Precision_Screwdriver_Set_1.jpg",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
  },
  {
    product: "USB-C Charging Connector Pack",
    author: "SparkFun Electronics",
    source: "https://commons.wikimedia.org/wiki/File:USB_Female_Type_C_Connector_(46356532491).jpg",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  {
    product: "ESD Anti-Static Wrist Strap",
    author: "Evan-Amos",
    source: "https://commons.wikimedia.org/wiki/File:AntiStatic-Wrist-Guard.jpg",
    license: "Public domain",
    licenseUrl: "https://commons.wikimedia.org/wiki/Commons:Public_domain",
  },
  {
    product: "USB-C Data Cable",
    author: "Fructibus",
    source: "https://commons.wikimedia.org/wiki/File:USB-C_cable_2017_A.jpg",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  {
    product: "SIM Card Adapter Set",
    author: "Tiia Monto",
    source: "https://commons.wikimedia.org/wiki/File:Sim_adapters.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
];

export default function ImageCreditsPage() {
  return (
    <main className="min-h-screen bg-[#070d18] px-6 py-16 text-slate-300">
      <div className="mx-auto max-w-4xl">
        <Link href="/store" className="text-sm font-semibold text-blue-400 hover:text-blue-300">
          ← Back to store
        </Link>
        <h1 className="mt-5 text-3xl font-extrabold text-white">Product image credits</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-400">
          These representative product photographs were obtained from Wikimedia Commons
          and resized for web delivery. Each local copy remains available under the
          license shown below. No endorsement by the photographers is implied.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
          {imageCredits.map((item) => (
            <article
              key={item.product}
              className="grid gap-3 border-b border-slate-800 bg-[#0b1220] p-5 last:border-b-0 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <h2 className="font-semibold text-white">{item.product}</h2>
                <p className="mt-1 text-sm text-slate-400">Photo by {item.author}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <a href={item.source} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                  Source
                </a>
                <a href={item.licenseUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                  {item.license}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
