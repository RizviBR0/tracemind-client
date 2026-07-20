import type { Metadata } from "next";
export const metadata: Metadata = { title: "Decision Workspace", description: "Use the AI-powered decision workspace to analyze your case, compare options, surface risks and generate actionable recommendations.", openGraph: { title: "Decision Workspace — TraceMind", description: "AI-powered decision analysis grounded in your case evidence." } };
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) { return children; }
