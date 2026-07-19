"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiCase } from "@/types/case";
import { CardSkeleton, CaseCard } from "@/components/case-card";

type PublicAnalytics = { publicCases: number; decisionsCompleted: number; documentsProcessed: number };
type CasesResponse = { items: ApiCase[]; total: number; page: number; pages: number };

export function LandingStats() {
  const query = useQuery({ queryKey: ["public-analytics"], queryFn: () => api<PublicAnalytics>("/api/v1/analytics/public") });
  const stats = query.data ? [[query.data.publicCases.toLocaleString(), "public decision cases"], [query.data.decisionsCompleted.toLocaleString(), "AI decisions completed"], [query.data.documentsProcessed.toLocaleString(), "documents processed"]] : [];
  return <section className="bg-slate-900 text-white"><div className="shell grid gap-8 md:grid-cols-3">{query.isLoading ? [1,2,3].map(item => <div className="space-y-3" key={item}><div className="h-10 w-28 animate-pulse rounded bg-slate-700"/><div className="h-4 w-44 animate-pulse rounded bg-slate-700"/></div>) : query.isError ? <div className="md:col-span-3"><p className="text-sm text-rose-200">Live platform totals are temporarily unavailable.</p><button className="mt-3 text-sm font-bold text-white underline" onClick={() => query.refetch()}>Retry</button></div> : stats.map(([value, label]) => <div key={label}><p className="text-4xl font-extrabold text-[#f59e0b]">{value}</p><p className="mt-2 text-sm text-slate-300">{label}</p></div>)}</div></section>;
}

export function FeaturedCases() {
  const query = useQuery({ queryKey: ["featured-cases"], queryFn: () => api<CasesResponse>("/api/v1/cases?sort=rating&page=1") });
  return <section className="shell">
    <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Real decisions, shared openly</p><h2 className="mt-3 text-3xl font-extrabold">Featured public cases</h2></div><Link href="/explore" className="hidden text-sm font-bold text-[#6956e8] sm:block">See all cases →</Link></div>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{query.isLoading ? [1,2,3,4].map(item => <CardSkeleton key={item}/>) : query.data?.items.slice(0,4).map(item => <CaseCard item={item} key={item._id}/>)}</div>
    {query.isError && <div className="card mt-8 p-8 text-center"><p className="text-sm text-rose-700">Unable to load featured cases.</p><button onClick={() => query.refetch()} className="btn btn-secondary mt-4">Retry</button></div>}
    {!query.isLoading && !query.isError && !query.data?.items.length && <div className="card mt-8 p-8 text-center"><p className="font-bold">No public cases yet.</p><p className="mt-2 text-sm text-slate-500">Published cases will appear here automatically.</p></div>}
  </section>;
}
