"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Globe2, LoaderCircle, Lock, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ApiCase } from "@/types/case";

const statusStyle: Record<ApiCase["status"], string> = {
  Draft: "bg-slate-100 text-slate-700",
  "Under review": "bg-amber-50 text-amber-700",
  Approved: "bg-teal-50 text-[#0f776e]",
  Rejected: "bg-rose-50 text-rose-700",
};

export default function Manage() {
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<ApiCase | null>(null);
  const [created, setCreated] = useState(false);
  useEffect(() => { setCreated(new URLSearchParams(window.location.search).get("created") === "1"); }, []);
  const casesQuery = useQuery({ queryKey: ["my-cases"], queryFn: () => api<ApiCase[]>("/api/v1/cases/mine") });
  const deletion = useMutation({
    mutationFn: (id: string) => api(`/api/v1/cases/${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-cases"] }); setConfirm(null); },
  });
  const publication = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: "public" | "private" }) => api<ApiCase>(`/api/v1/cases/${id}/publication`, { method: "PATCH", body: JSON.stringify({ visibility }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-cases"] }),
  });
  const items = casesQuery.data || [];

  function PublicationButton({ item, compact = false }: { item: ApiCase; compact?: boolean }) {
    const publicRequest = item.visibility === "private" || item.status === "Rejected";
    const label = item.status === "Rejected" ? "Resubmit" : publicRequest ? "Submit for review" : item.status === "Under review" ? "Withdraw" : "Make private";
    return <button disabled={publication.isPending} onClick={() => publication.mutate({ id: item._id, visibility: publicRequest ? "public" : "private" })} className={`btn btn-secondary ${compact ? "!min-h-8 text-xs" : "!min-h-8 !px-2"}`} title={label} aria-label={`${label} ${item.title}`}>
      {item.status === "Rejected" ? <RotateCcw size={15}/> : publicRequest ? <Globe2 size={15}/> : <Lock size={15}/>}<span className={compact ? "" : "sr-only"}>{label}</span>
    </button>;
  }

  return <div className="shell py-10">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Your workspace</p><h1 className="mt-2 text-3xl font-extrabold">Manage knowledge cases</h1><p className="mt-3 text-slate-600">Private cases stay in your workspace. Public submissions appear in Explore only after approval.</p></div>
      <Link href="/items/add" className="btn btn-primary"><Plus size={16}/> Add case</Link>
    </div>
    {created && <p className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-[#0f776e]">Your case was created successfully.</p>}
    {publication.isError && <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{publication.error.message}</p>}
    {casesQuery.isLoading && <div className="card mt-8 grid place-items-center p-12 text-sm text-slate-500"><LoaderCircle className="mb-3 animate-spin text-[#6956e8]"/>Loading your cases…</div>}
    {casesQuery.isError && <div className="card mt-8 p-8 text-center"><p className="font-bold text-rose-700">{casesQuery.error.message}</p><button onClick={() => casesQuery.refetch()} className="btn btn-secondary mt-4">Retry</button></div>}
    {!casesQuery.isLoading && !casesQuery.isError && items.length === 0 && <div className="card mt-8 p-12 text-center"><h2 className="font-bold">No cases yet</h2><p className="mt-2 text-sm text-slate-500">Create your first knowledge case to begin a decision workspace.</p><Link className="btn btn-primary mt-5" href="/items/add">Create first case</Link></div>}
    {items.length > 0 && <div className="card mt-8 overflow-hidden">
      <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Case</th><th>Category</th><th>Visibility</th><th>Status</th><th className="p-4">Actions</th></tr></thead><tbody>{items.map(item => <tr key={item._id} className="border-t border-slate-100 align-top"><td className="p-4"><div className="flex items-start gap-3"><div className="grid h-10 w-12 shrink-0 place-items-center overflow-hidden rounded bg-violet-50 text-xs font-bold text-[#6956e8]">{item.coverImage ? <img src={item.coverImage} alt="" className="h-full w-full object-cover"/> : item.category.slice(0, 2).toUpperCase()}</div><div><p className="font-bold">{item.title}</p><p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>{item.status === "Rejected" && item.moderationNote && <p className="mt-2 max-w-md text-xs leading-5 text-rose-700"><strong>Admin feedback:</strong> {item.moderationNote}</p>}</div></div></td><td className="py-4">{item.category}</td><td className="py-4 capitalize">{item.visibility}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[item.status]}`}>{item.status}</span></td><td className="p-4"><div className="flex gap-2">{item.status === "Approved" && <Link className="btn btn-secondary !min-h-8 !px-2" href={`/items/${item.slug}`} aria-label={`View ${item.title}`}><Eye size={15}/></Link>}<PublicationButton item={item}/><button onClick={() => setConfirm(item)} className="btn btn-secondary !min-h-8 !px-2 text-rose-700" aria-label={`Delete ${item.title}`}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>
      <div className="grid gap-3 p-4 md:hidden">{items.map(item => <article className="rounded-lg border border-slate-200 p-4" key={item._id}><div className="flex items-start justify-between gap-3"><p className="font-bold">{item.title}</p><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusStyle[item.status]}`}>{item.status}</span></div><p className="mt-2 text-sm capitalize text-slate-500">{item.category} · {item.priority} · {item.visibility}</p>{item.status === "Rejected" && item.moderationNote && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs leading-5 text-rose-700"><strong>Admin feedback:</strong> {item.moderationNote}</p>}<div className="mt-3 flex flex-wrap gap-2">{item.status === "Approved" && <Link className="btn btn-secondary !min-h-8 text-xs" href={`/items/${item.slug}`}>View</Link>}<PublicationButton item={item} compact/><button className="btn btn-secondary !min-h-8 text-xs text-rose-700" onClick={() => setConfirm(item)}>Delete</button></div></article>)}</div>
    </div>}
    {confirm && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div className="card max-w-sm p-6" role="dialog" aria-modal="true"><h2 className="font-bold">Delete “{confirm.title}”?</h2><p className="mt-2 text-sm text-slate-500">This removes the case and its documents. This action cannot be undone.</p>{deletion.isError && <p className="mt-3 text-sm text-rose-700">{deletion.error.message}</p>}<div className="mt-5 flex justify-end gap-2"><button disabled={deletion.isPending} onClick={() => setConfirm(null)} className="btn btn-secondary">Cancel</button><button disabled={deletion.isPending} onClick={() => deletion.mutate(confirm._id)} className="btn bg-rose-700 text-white">{deletion.isPending ? "Deleting…" : "Delete case"}</button></div></div></div>}
  </div>;
}
