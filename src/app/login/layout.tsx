import type { Metadata } from "next";
export const metadata: Metadata = { title: "Log In", description: "Sign in to your TraceMind account to access your decision cases, workspace, and AI-powered analysis.", robots: { index: false, follow: true } };
export default function LoginLayout({ children }: { children: React.ReactNode }) { return children; }
