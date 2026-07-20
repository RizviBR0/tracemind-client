import type { Metadata } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { AppProviders } from "@/providers/app-providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tracemind.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TraceMind — Decision intelligence",
    template: "%s | TraceMind",
  },
  description: "Turn scattered information into confident decisions. TraceMind connects your evidence, surfaces risks and helps you choose the strongest next step.",
  keywords: ["decision intelligence", "decision making", "evidence analysis", "risk assessment", "AI recommendations", "case management", "document analysis", "TraceMind"],
  authors: [{ name: "TraceMind" }],
  creator: "TraceMind",
  publisher: "TraceMind",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TraceMind",
    title: "TraceMind — Decision intelligence",
    description: "Turn scattered information into confident decisions. TraceMind connects your evidence, surfaces risks and helps you choose the strongest next step.",
  },
  twitter: {
    card: "summary",
    title: "TraceMind — Decision intelligence",
    description: "Turn scattered information into confident decisions. TraceMind connects your evidence, surfaces risks and helps you choose the strongest next step.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
};

export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en" data-scroll-behavior="smooth"><body><AppProviders><AppShell>{children}</AppShell></AppProviders></body></html>; }
