import type { Metadata } from "next";
export const metadata: Metadata = { title: "Administration", description: "TraceMind admin panel for managing users, moderating cases, and monitoring platform health.", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return children; }
