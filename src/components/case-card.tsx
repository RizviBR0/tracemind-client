import Link from "next/link";
import { ArrowUpRight, CalendarDays, Star } from "lucide-react";
import type { ApiCase } from "@/types/case";

export function CaseCard({ item }: { item: ApiCase }) {
  return <article className="card flex h-full flex-col overflow-hidden">
    {item.coverImage ? <img src={item.coverImage} alt="" className="h-40 w-full object-cover"/> : <div role="img" aria-label={`${item.category} case cover`} className="grid h-40 place-items-center bg-slate-100 px-5 text-center"><span className="text-sm font-extrabold uppercase tracking-widest text-[#6956e8]">{item.category}</span></div>}
    <div className="flex flex-1 flex-col p-5">
      <div className="mb-3 flex items-center justify-between text-xs font-bold"><span className="rounded-full bg-violet-50 px-2 py-1 text-[#6956e8]">{item.category}</span><span className={item.priority === "High" ? "text-amber-600" : "text-slate-500"}>{item.priority} priority</span></div>
      <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900">{item.title}</h3>
      <p className="mt-2 line-clamp-3 min-h-15 text-sm leading-5 text-slate-500">{item.shortDescription}</p>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500"><span className="flex items-center gap-1"><Star size={14} className={item.reviewCount ? "fill-amber-400 text-amber-400" : "text-slate-400"}/>{item.reviewCount ? `${item.averageRating.toFixed(1)} (${item.reviewCount})` : "Not rated"}</span><span className="flex items-center gap-1"><CalendarDays size={14}/>{new Date(item.createdAt).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</span></div>
      <Link className="btn btn-secondary mt-4 w-full text-sm" href={`/items/${item.slug}`}>View details <ArrowUpRight size={15}/></Link>
    </div>
  </article>;
}

export function CardSkeleton() { return <div className="card overflow-hidden"><div className="h-40 animate-pulse bg-slate-200"/><div className="space-y-3 p-5"><div className="h-4 w-2/5 animate-pulse rounded bg-slate-200"/><div className="h-5 animate-pulse rounded bg-slate-200"/><div className="h-14 animate-pulse rounded bg-slate-200"/></div></div>; }
