"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/app-providers";

export function ReviewForm({ caseId, slug }: { caseId: string; slug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  if (!user) return <p className="mt-4 text-sm text-slate-500"><Link className="font-semibold text-[#6956e8]" href={`/login?next=/items/${slug}`}>Log in</Link> to leave a review.</p>;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      await api(`/api/v1/cases/${caseId}/reviews`, { method: "POST", body: JSON.stringify({ rating, comment }) });
      setComment("");
      setNotice("Your review was saved.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save your review.");
    } finally { setBusy(false); }
  }

  return <form className="mt-5 border-t border-slate-100 pt-5" onSubmit={submit}>
    <label className="grid gap-1.5 text-sm font-semibold">Rating<select className="rounded-lg border border-slate-300 px-3 py-2 font-normal" value={rating} onChange={event => setRating(Number(event.target.value))}>{[5,4,3,2,1].map(value => <option value={value} key={value}>{value} / 5</option>)}</select></label>
    <label className="mt-3 grid gap-1.5 text-sm font-semibold">Comment<textarea required minLength={5} maxLength={1000} rows={3} value={comment} onChange={event => setComment(event.target.value)} className="rounded-lg border border-slate-300 p-3 font-normal" placeholder="Share what was useful or missing." /></label>
    <button disabled={busy || comment.trim().length < 5} className="btn btn-secondary mt-3 w-full disabled:opacity-50">{busy ? <><LoaderCircle className="animate-spin" size={16} /> Saving…</> : "Submit review"}</button>
    {notice && <p aria-live="polite" className="mt-2 text-xs text-slate-500">{notice}</p>}
  </form>;
}
