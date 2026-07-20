import type { Metadata } from "next";
export const metadata: Metadata = { title: "Create Account", description: "Create a free TraceMind account to start organizing evidence, analyzing decisions, and generating AI-powered recommendations.", robots: { index: false, follow: true } };
export default function RegisterLayout({ children }: { children: React.ReactNode }) { return children; }
