"use client";

import { KeyRound, LoaderCircle, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { useAuth } from "@/providers/app-providers";

type AiKeyStatus = { configured: boolean; keyHint: string | null; storageAvailable: boolean };

export default function Profile() {
  const { user, loading, refresh } = useAuth();
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [removingKey, setRemovingKey] = useState(false);
  const aiKeyQuery = useQuery({ queryKey: ["ai-key-status"], queryFn: () => api<AiKeyStatus>("/api/auth/ai-key") });
  useEffect(() => { if (user) setName(user.name); }, [user]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    try { await api("/api/auth/profile", { method: "PATCH", body: JSON.stringify({ name }) }); await refresh(); showSuccessToast("Profile saved."); }
    catch (err) { showErrorToast(err, "Couldn’t save your profile."); }
    finally { setSavingProfile(false); }
  }

  async function saveAiKey(event: React.FormEvent) {
    event.preventDefault();
    if (!apiKey.trim()) return;
    setSavingKey(true);
    try { await api("/api/auth/ai-key", { method: "PUT", body: JSON.stringify({ apiKey: apiKey.trim() }) }); setApiKey(""); await aiKeyQuery.refetch(); showSuccessToast("Personal Gemini key saved."); }
    catch (err) { showErrorToast(err, "Couldn’t save the API key."); }
    finally { setSavingKey(false); }
  }

  async function removeAiKey() {
    if (!window.confirm("Remove your personal Gemini API key? TraceMind will use the shared key again.")) return;
    setRemovingKey(true);
    try { await api("/api/auth/ai-key", { method: "DELETE" }); await aiKeyQuery.refetch(); showSuccessToast("Personal Gemini key removed."); }
    catch (err) { showErrorToast(err, "Couldn’t remove the API key."); }
    finally { setRemovingKey(false); }
  }

  if (loading) return <div className="shell grid place-items-center py-20"><LoaderCircle className="animate-spin text-[#6956e8]"/></div>;
  const keyStatus = aiKeyQuery.data;
  return <div className="shell max-w-3xl py-10">
    <p className="eyebrow">Account settings</p><h1 className="mt-2 text-3xl font-extrabold">Your profile</h1>
    <form onSubmit={saveProfile} className="card mt-8 grid gap-5 p-6">
      <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-1.5 text-sm font-bold">Full name<input required minLength={2} value={name} onChange={event => setName(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal"/></label><label className="grid gap-1.5 text-sm font-bold">Email<input value={user?.email || ""} readOnly type="email" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-500"/></label></div>
      <p className="text-sm text-slate-500">Email changes require identity verification. Contact support if you need to update it.</p>
      <div className="flex justify-end"><button disabled={savingProfile} className="btn btn-primary disabled:opacity-60">{savingProfile ? "Saving…" : "Save changes"}</button></div>
    </form>

    <section id="ai-access" className="card mt-6 p-6 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-[#6956e8]"><KeyRound size={18}/></span><div><p className="font-extrabold">AI access</p><p className="mt-0.5 text-sm text-slate-500">Add a personal Gemini key if the shared limit is busy.</p></div></div></div>{keyStatus?.configured && <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-[#0f776e]">Personal key active {keyStatus.keyHint}</span>}</div>
      {aiKeyQuery.isLoading && <p className="mt-5 text-sm text-slate-500">Checking AI access…</p>}
      {aiKeyQuery.isError && <div className="mt-5 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><span>Couldn’t load AI key settings.</span><button onClick={() => aiKeyQuery.refetch()} className="font-bold underline">Retry</button></div>}
      {keyStatus && !keyStatus.storageAvailable && <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">Personal AI keys are unavailable until the server administrator configures encrypted key storage.</p>}
      {keyStatus?.storageAvailable && <><form onSubmit={saveAiKey} className="mt-5 grid gap-3"><label className="grid gap-1.5 text-sm font-bold">Personal AI API key<input required minLength={20} maxLength={300} autoComplete="off" value={apiKey} onChange={event => setApiKey(event.target.value)} type="password" className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal" placeholder={keyStatus.configured ? "Enter a replacement key" : "Paste only your API key"}/></label><p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#0f9f91]"/>Stored securely and used only for your AI decisions and document analysis.</p><div className="flex flex-wrap justify-end gap-2">{keyStatus.configured && <button type="button" disabled={removingKey || savingKey} onClick={removeAiKey} className="btn btn-secondary text-rose-700 disabled:opacity-50"><Trash2 size={16}/>{removingKey ? "Removing…" : "Remove key"}</button>}<button disabled={savingKey || !apiKey.trim()} className="btn btn-primary disabled:opacity-50">{savingKey ? "Saving…" : keyStatus.configured ? "Replace key" : "Save key"}</button></div></form></>}
    </section>
  </div>;
}
