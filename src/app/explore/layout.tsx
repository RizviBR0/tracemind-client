import type { Metadata } from "next";
export const metadata: Metadata = { title: "Explore Public Cases", description: "Browse community-shared decision cases. See how others approach complex decisions with evidence-based reasoning and AI recommendations.", openGraph: { title: "Explore Public Cases — TraceMind", description: "Browse community-shared decision cases and AI-powered insights." } };
export default function ExploreLayout({ children }: { children: React.ReactNode }) { return children; }
