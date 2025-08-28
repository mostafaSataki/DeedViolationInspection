import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "سیستم تحلیل اسناد ملکی",
  description: "سیستم تحلیل اسناد ملکی با استفاده از هوش مصنوعی برای شناسایی تخلفات احتمالی",
  keywords: ["اسناد ملکی", "تحلیل سند", "هوش مصنوعی", "تخلفات ملکی", "Next.js", "TypeScript"],
  authors: [{ name: "Deed Analysis Team" }],
  openGraph: {
    title: "سیستم تحلیل اسناد ملکی",
    description: "تحلیل اسناد ملکی با هوش مصنوعی",
    url: "https://localhost:3000",
    siteName: "سیستم تحلیل اسناد ملکی",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "سیستم تحلیل اسناد ملکی",
    description: "تحلیل اسناد ملکی با هوش مصنوعی",
  },
  other: {
    'iran-sans-font': 'true',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${interSans.variable} font-sans antialiased bg-background text-foreground`}
        style={{ fontFamily: 'Iran Sans, Inter, sans-serif' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
