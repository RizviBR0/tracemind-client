import type { Metadata } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { AppProviders } from "@/providers/app-providers";
export const metadata: Metadata = { title: "TraceMind — Decision intelligence", description: "Turn scattered information into confident decisions." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en" data-scroll-behavior="smooth"><body><AppProviders><AppShell>{children}</AppShell></AppProviders></body></html>; }
