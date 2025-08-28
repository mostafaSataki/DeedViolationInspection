import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
