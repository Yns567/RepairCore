import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: {
    default: "RepairCore | Tools & Electronics",
    template: "%s | RepairCore",
  },
  description: "Professional tools, software and parts for mobile repair technicians.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
