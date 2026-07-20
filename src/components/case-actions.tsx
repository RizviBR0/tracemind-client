"use client";

import { useRouter } from "next/navigation";
import { Flag, Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/providers/app-providers";

export function CaseActions({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const client = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) api<{ saved: boolean }>(`/api/v1/cases/${slug}/saved`).then(result => setSaved(result.saved)).catch(() => undefined);
  }, [slug, user]);

  function requireUser() {
    if (user) return true;
    router.push(`/login?next=/items/${slug}`);
    return false;
  }

  async function toggleSave() {
    if (!requireUser()) return;
    setBusy(true); setNotice("");
    try { const result = await api<{ saved: boolean }>(`/api/v1/cases/${slug}/save`, { method: "POST" }); setSaved(result.saved); setNotice(result.saved ? "Case saved." : "Case removed from saved items."); client.invalidateQueries({ queryKey: ["saved-cases"] }); }
    catch (error) { setNotice(error instanceof ApiError ? error.message : "Unable to save this case."); }
    finally { setBusy(false); }
  }

  async function share() {
    const shareData = { title, text: `Review this TraceMind decision case: ${title}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(window.location.href); setNotice("Case link copied."); }
    } catch (error) { if ((error as Error).name !== "AbortError") setNotice("Unable to share this case."); }
  }

  async function report() {
    if (!requireUser()) return;
    setBusy(true); setNotice("");
    try { await api(`/api/v1/cases/${slug}/report`, { method: "POST", body: JSON.stringify({ reason: "Inappropriate or inaccurate public content" }) }); setNotice("Report submitted for moderator review."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Unable to submit the report."); }
    finally { setBusy(false); }
  }

  return <div className="mt-5 grid gap-2">
    <button disabled={busy} onClick={toggleSave} className="btn btn-primary"><Heart size={16} fill={saved ? "currentColor" : "none"}/> {saved ? "Saved" : "Save case"}</button>
    <button onClick={share} className="btn btn-secondary"><Share2 size={16}/> Share</button>
    <button disabled={busy} onClick={report} className="btn btn-secondary text-rose-700"><Flag size={16}/> Report case</button>
    {notice && <p aria-live="polite" className="mt-1 text-center text-xs text-slate-500">{notice}</p>}
  </div>;
}
