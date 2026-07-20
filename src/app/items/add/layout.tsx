import type { Metadata } from "next";
export const metadata: Metadata = { title: "Create a Case", description: "Define a new decision case with goals, constraints, and supporting evidence for AI-powered analysis.", robots: { index: false, follow: true } };
export default function AddCaseLayout({ children }: { children: React.ReactNode }) { return children; }
