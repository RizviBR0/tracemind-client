import type { Metadata } from "next";
export const metadata: Metadata = { title: "Manage Cases", description: "View, edit, and manage your decision cases. Control visibility, submit for review, or delete cases.", robots: { index: false, follow: false } };
export default function ManageCasesLayout({ children }: { children: React.ReactNode }) { return children; }
