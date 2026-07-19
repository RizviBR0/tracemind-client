"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api";
import type { ApiCase } from "@/types/case";
import { CardSkeleton, CaseCard } from "@/components/case-card";

type CasesResponse = { items: ApiCase[]; total: number; page: number; pages: number };
const categoryOptions = ["All categories", "Technology", "Product", "People", "UX Research", "Strategy"];

export default function Explore() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All categories");
  const [priority, setPriority] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(q);

  useEffect(() => setPage(1), [deferredQuery, category, priority, sort]);
  const params = useMemo(() => {
    const value = new URLSearchParams({ page: String(page), sort });
    if (deferredQuery.trim()) value.set("q", deferredQuery.trim());
    if (category !== "All categories") value.set("category", category);
    if (priority !== "All") value.set("priority", priority);
    return value.toString();
  }, [deferredQuery, category, priority, sort, page]);

  const query = useQuery({ queryKey: ["cases", params], queryFn: () => api<CasesResponse>(`/api/v1/cases?${params}`) });
  const clear = () => { setQ(""); setCategory("All categories"); setPriority("All"); setSort("newest"); setPage(1); };

  return <div className="shell py-10">
    <p className="eyebrow">Explore public case studies</p>
    <h1 className="mt-2 text-4xl font-extrabold">Learn from decisions with context.</h1>
    <p className="mt-3 max-w-2xl text-slate-600">Browse real decision records, their constraints and the thinking that led to action.</p>
    <div className="card mt-8 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_180px_150px_180px]">
        <label className="relative"><span className="sr-only">Search public cases</span><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input value={q} onChange={event => setQ(event.target.value)} className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm" placeholder="Search title, description or tags"/></label>
        <select aria-label="Category" value={category} onChange={event => setCategory(event.target.value)} className="rounded-lg border border-slate-200 px-3 text-sm">{categoryOptions.map(option => <option key={option}>{option}</option>)}</select>
        <select aria-label="Priority" value={priority} onChange={event => setPriority(event.target.value)} className="rounded-lg border border-slate-200 px-3 text-sm">{["All", "High", "Medium", "Low"].map(option => <option key={option}>{option}</option>)}</select>
        <select aria-label="Sort cases" value={sort} onChange={event => setSort(event.target.value)} className="rounded-lg border border-slate-200 px-3 text-sm"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="rating">Highest rated</option><option value="views">Most viewed</option></select>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><SlidersHorizontal size={15} className="text-slate-500"/><span className="text-slate-500">{query.data?.total ?? 0} matching cases</span>{(q || category !== "All categories" || priority !== "All") && <button onClick={clear} className="ml-auto flex items-center gap-1 font-bold text-[#6956e8]"><X size={15}/> Clear filters</button>}</div>
    </div>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{query.isLoading ? [1,2,3,4,5,6,7,8].map(item => <CardSkeleton key={item}/>) : query.data?.items.map(item => <CaseCard item={item} key={item._id}/>)}</div>
    {query.isError && <div className="card mt-8 p-10 text-center"><h2 className="font-bold text-rose-700">{query.error.message}</h2><button onClick={() => query.refetch()} className="btn btn-secondary mt-5">Retry</button></div>}
    {!query.isLoading && !query.isError && !query.data?.items.length && <div className="card mt-8 p-10 text-center"><h2 className="font-bold">No cases match those filters.</h2><p className="mt-2 text-sm text-slate-500">Try a broader search or clear the active filters.</p><button onClick={clear} className="btn btn-secondary mt-5">Clear filters</button></div>}
    <div className="mt-10 flex items-center justify-center gap-2"><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn btn-secondary disabled:opacity-40">Previous</button><span className="grid h-10 min-w-10 place-items-center rounded-lg bg-[#6956e8] px-3 text-sm font-bold text-white">{page} / {Math.max(query.data?.pages || 1, 1)}</span><button onClick={() => setPage(page + 1)} disabled={page >= (query.data?.pages || 1)} className="btn btn-secondary disabled:opacity-40">Next</button></div>
  </div>;
}
