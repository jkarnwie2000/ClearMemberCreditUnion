import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ClearMember Credit Union – Member Dashboard",
    template: "%s | ClearMember Credit Union",
  },
  description:
    "A member-centered digital banking demo that explains pending transactions, holds, fees, and transfers in plain language. All data is synthetic.",
  applicationName: "ClearMember Credit Union",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A1A33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
