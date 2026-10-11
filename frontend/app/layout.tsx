import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { I18nProvider } from "@/lib/i18n/client";
import { directionOf } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { baseUrl } from "@/lib/base-url";

// Cairo covers Arabic, French and English with one consistent look.
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

const DESCRIPTION =
  "RepairCore — متجر المغرب لتقنيي إصلاح الهواتف: أدوات وبوكسات ومبرمجات وقطع غيار، خدمات IMEI وكريديت وتأجير الأدوات، وبرامج ودورات. Tools, GSM services and software for phone repair technicians in Morocco.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl()),
  title: {
    default: "RepairCore | Tools, GSM Services & Parts",
    template: "%s | RepairCore",
  },
  description: DESCRIPTION,
  keywords: ["RepairCore", "GSM Morocco", "IMEI check", "phone repair tools", "unlock tools", "إصلاح الهواتف", "خدمات GSM", "المغرب"],
  applicationName: "RepairCore",
  openGraph: {
    type: "website",
    siteName: "RepairCore",
    title: "RepairCore | Tools, GSM Services & Parts",
    description: DESCRIPTION,
    url: baseUrl(),
  },
  twitter: {
    card: "summary",
    title: "RepairCore | Tools, GSM Services & Parts",
    description: DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <I18nProvider locale={locale} messages={dictionaries[locale]}>
          <Navbar />
          {children}
          <Footer />
          <WhatsAppButton />
        </I18nProvider>
      </body>
    </html>
  );
}
