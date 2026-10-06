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

// Cairo covers Arabic, French and English with one consistent look.
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "RepairCore | Tools & Electronics",
    template: "%s | RepairCore",
  },
  description: "Professional tools, software and parts for mobile repair technicians.",
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
