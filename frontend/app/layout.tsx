import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { I18nProvider } from "@/lib/i18n/client";
import { directionOf } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} messages={dictionaries[locale]}>
          <Navbar />
          {children}
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
