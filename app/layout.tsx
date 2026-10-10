import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import StorageStatusBanner from "@/components/ui/StorageStatusBanner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SiteGenAI — Imagine it. Design it. Make it yours.",
  description: "Imagine it. Design it. Make it yours. Professional AI-powered website builder with interactive templates and visual editing.",
  keywords: ["AI website builder", "SiteGenAI", "Bootstrap 5.3", "visual editor", "website templates"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
      <body className="d-flex flex-column min-vh-100">
        <StorageStatusBanner />
        {children}
      </body>
    </html>
  );
}
