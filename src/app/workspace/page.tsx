"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Copy,
  FileText,
  Globe2,
  LoaderCircle,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Square,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SnakeGame } from "@/components/snake-game";
import { api } from "@/lib/api";
import { showErrorToast } from "@/lib/toasts";
import type { ApiCase } from "@/types/case";

type Message = { role: "user" | "agent"; text: string };
type DecisionResult = {
  recommendedOption: string;
  explanation: string;
  confidence: string;
  alternatives: string[];
  risks: string[];
  assumptions: string[];
  actionItems: string[];
  suggestedFollowUps: string[];
};

const defaultPrompts = [
  "What information could change this decision?",
  "Show the risk trade-offs.",
  "Turn the recommendation into action items.",
];
const welcomeMessage = "Ask what you need to decide. I’ll use this case’s goals, constraints, and processed evidence to build a grounded recommendation.";

export default function Workspace() {
  const queryClient = useQueryClient();
  const casesQuery = useQuery({ queryKey: ["my-cases"], queryFn: () => api<ApiCase[]>("/api/v1/cases/mine") });
  const [caseId, setCaseId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "agent", text: welcomeMessage }]);
  const [text, setText] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [insightEditorOpen, setInsightEditorOpen] = useState(false);
  const [insightTitle, setInsightTitle] = useState("");
  const [insightSummary, setInsightSummary] = useState("");
  const [insightBusy, setInsightBusy] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [gameVisible, setGameVisible] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!caseId && casesQuery.data?.[0]) setCaseId(casesQuery.data[0]._id);
  }, [caseId, casesQuery.data]);
  useEffect(() => { if (typing) setGameVisible(true); }, [typing]);
  useEffect(() => {
    const stream = streamRef.current;
    if (stream) stream.scrollTo({ top: stream.scrollHeight, behavior: "smooth" });
  }, [messages, typing, error]);

  async function send(value = text, appendUserMessage = true) {
    const prompt = value.trim();
    if (!prompt || !caseId || typing) return;
    setError("");
    setLastPrompt(prompt);
    if (appendUserMessage) setMessages(current => [...current, { role: "user", text: prompt }]);
    setText("");
    setTyping(true);
    abortRef.current = new AbortController();
    try {
      if (!sessionId) {
        const response = await api<{ session: { _id: string }; result: DecisionResult }>("/api/v1/ai/decisions", {
          method: "POST",
          body: JSON.stringify({ caseId, message: prompt }),
          signal: abortRef.current.signal,
        });
        setSessionId(response.session._id);
        setResult(response.result);
        setSaved(false);
        setMessages(current => [...current, { role: "agent", text: response.result.explanation }]);
      } else {
        const response = await api<{ result: DecisionResult }>(`/api/v1/ai/decisions/${sessionId}/message`, {
          method: "POST",
          body: JSON.stringify({ message: prompt }),
          signal: abortRef.current.signal,
        });
        setResult(response.result);
        setSaved(false);
        setMessages(current => [...current, { role: "agent", text: response.result.explanation }]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") { setError(err instanceof Error ? err.message : "The decision agent could not respond."); showErrorToast(err, "The AI response couldn’t be completed."); }
    } finally {
      setTyping(false);
      abortRef.current = null;
      requestAnimationFrame(() => composerRef.current?.focus());
    }
  }

  async function regenerate() {
    if (!sessionId || typing) return;
    setError("");
    setTyping(true);
    abortRef.current = new AbortController();
    try {
      const response = await api<{ result: DecisionResult }>(`/api/v1/ai/decisions/${sessionId}/regenerate`, { method: "POST", signal: abortRef.current.signal });
      setResult(response.result);
      setSaved(false);
      setMessages(current => [...current, { role: "agent", text: response.result.explanation }]);
    } catch (err) {
      if ((err as Error).name !== "AbortError") { setError(err instanceof Error ? err.message : "Unable to regenerate."); showErrorToast(err, "Couldn’t regenerate the response."); }
    } finally {
      setTyping(false);
      abortRef.current = null;
      requestAnimationFrame(() => composerRef.current?.focus());
    }
  }

  function stop() {
    abortRef.current?.abort();
    setTyping(false);
    setError("Generation stopped. You can retry the last question when ready.");
  }

  async function saveRecommendation() {
    if (!sessionId || !result) return;
    try {
      await api(`/api/v1/ai/decisions/${sessionId}/save`, { method: "POST" });
      setSaved(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save the recommendation."); }
  }

  function openInsightEditor() {
    if (!result) return;
    setInsightTitle(activeCase?.publicInsight?.title || result.recommendedOption);
    setInsightSummary(activeCase?.publicInsight?.summary || result.explanation);
    setInsightError("");
    setInsightEditorOpen(true);
  }

  async function publishInsight(event: React.FormEvent) {
    event.preventDefault();
    if (!sessionId) return;
    setInsightBusy(true);
    setInsightError("");
    try {
      await api(`/api/v1/ai/decisions/${sessionId}/publish`, { method: "POST", body: JSON.stringify({ title: insightTitle.trim(), summary: insightSummary.trim() }) });
      await queryClient.invalidateQueries({ queryKey: ["my-cases"] });
      setInsightEditorOpen(false);
    } catch (err) { setInsightError(err instanceof Error ? err.message : "Unable to publish the insight."); }
    finally { setInsightBusy(false); }
  }

  async function removeInsight() {
    if (!activeCase?.publicInsight || !window.confirm("Remove this public AI insight? An approved public case will return to review.")) return;
    setInsightBusy(true);
    setInsightError("");
    try { await api(`/api/v1/cases/${activeCase._id}/public-insight`, { method: "DELETE" }); await queryClient.invalidateQueries({ queryKey: ["my-cases"] }); }
    catch (err) { setInsightError(err instanceof Error ? err.message : "Unable to remove the insight."); }
    finally { setInsightBusy(false); }
  }

  function changeCase(id: string) {
    setCaseId(id);
    setSessionId("");
    setResult(null);
    setSaved(false);
    setInsightEditorOpen(false);
    setInsightError("");
    setError("");
    setText("");
    setMessages([{ role: "agent", text: welcomeMessage }]);
  }

  const activeCase = casesQuery.data?.find(item => item._id === caseId);
  const prompts = result?.suggestedFollowUps?.length ? result.suggestedFollowUps : defaultPrompts;

  return <div className="shell workspace-shell">
    {gameVisible && <SnakeGame active={typing} hasError={Boolean(error)} onClose={() => setGameVisible(false)} />}

    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Decision intelligence workspace</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{activeCase?.title || "Decision workspace"}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Bring the question. TraceMind keeps the evidence, reasoning, and next steps together.</p></div>
      <div className="flex gap-2"><Link href="/items/add" className="btn btn-secondary"><Upload size={16} /> Add evidence</Link>{sessionId && <button disabled={typing} onClick={regenerate} className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={16} /> Regenerate</button>}</div>
    </header>

    {casesQuery.isLoading && <div className="card grid place-items-center p-16 text-sm text-slate-500"><LoaderCircle className="mb-3 animate-spin text-[#6956e8]" />Loading your workspace…</div>}
    {casesQuery.isError && <div className="card p-10 text-center"><AlertCircle className="mx-auto text-rose-600" /><p className="mt-3 font-bold text-rose-700">{casesQuery.error.message}</p><button onClick={() => casesQuery.refetch()} className="btn btn-secondary mt-5">Retry</button></div>}
    {!casesQuery.isLoading && !casesQuery.isError && casesQuery.data?.length === 0 && <div className="card p-12 text-center"><FileText className="mx-auto text-[#6956e8]" /><h2 className="mt-4 font-bold">Create a case before starting the agent</h2><p className="mt-2 text-sm text-slate-500">The agent needs a problem, goals, and constraints to reason from.</p><Link href="/items/add" className="btn btn-primary mt-5">Create a case</Link></div>}

    {!!casesQuery.data?.length && <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="card flex min-h-[40rem] flex-col overflow-hidden" aria-label="Decision conversation">
        <div className="border-b border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500"><span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-50 text-[#6956e8]"><FileText size={14} /></span>Active case</span>
            <div className="flex flex-wrap gap-2">{activeCase && <><span className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">{activeCase.category}</span><span className="whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">{activeCase.priority} priority</span><span className="whitespace-nowrap rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-[#0f776e]">{activeCase.status}</span></>}</div>
          </div>
          <label className="mt-4 block"><span className="sr-only">Active case</span><select aria-label="Active case" value={caseId} onChange={event => changeCase(event.target.value)} className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-[#6956e8] focus:ring-2 focus:ring-violet-100">{casesQuery.data.map(item => <option value={item._id} key={item._id}>{item.title}</option>)}</select></label>
          {activeCase && <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{activeCase.shortDescription}</p>}
        </div>

        <div ref={streamRef} className="min-h-[16rem] flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:max-h-[55vh] sm:p-6" aria-live="polite">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message, index) => message.role === "agent"
              ? <div className="flex items-start gap-3" key={index}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-violet-100 bg-violet-50 text-[#6956e8]"><Bot size={18} /></div><div className="min-w-0 max-w-[88%]"><div className="mb-1.5 flex items-center gap-2"><span className="text-xs font-bold text-slate-700">TraceMind</span><span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#0f776e]">Agent</span></div><div className="group relative rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm leading-7 text-slate-700 shadow-sm"><p className="whitespace-pre-wrap">{message.text}</p><button onClick={() => navigator.clipboard.writeText(message.text)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 focus:opacity-100 group-hover:opacity-100" aria-label="Copy response"><Copy size={14} /></button></div></div></div>
              : <div className="flex items-start justify-end gap-3" key={index}><div className="min-w-0 max-w-[82%]"><div className="mb-1.5 flex items-center justify-end gap-2"><span className="text-xs font-bold text-slate-600">You</span></div><div className="rounded-2xl rounded-tr-md bg-[#6956e8] px-4 py-3.5 text-sm leading-7 text-white shadow-sm"><p className="whitespace-pre-wrap">{message.text}</p></div></div><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-white"><UserRound size={17} /></div></div>)}

            {typing && <div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-violet-100 bg-violet-50 text-[#6956e8]"><Bot size={18} /></div><div><p className="mb-1.5 text-xs font-bold text-slate-700">TraceMind</p><div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"><span className="flex gap-1" aria-hidden="true"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6956e8]" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6956e8] [animation-delay:150ms]" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6956e8] [animation-delay:300ms]" /></span>Reviewing the case evidence…</div></div></div>}

            {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"><AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={18} /><div className="min-w-0 flex-1"><p className="text-sm font-bold text-rose-800">The response could not be completed</p><p className="mt-1 text-sm leading-6 text-rose-700">{error}</p><div className="mt-3 flex gap-2">{lastPrompt && <button disabled={typing} onClick={() => void send(lastPrompt, false)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-200">Try again</button>}<button onClick={() => setError("")} className="rounded-lg px-3 py-1.5 text-xs font-bold text-rose-600">Dismiss</button></div></div><button onClick={() => setError("")} className="text-rose-500" aria-label="Dismiss error"><X size={16} /></button></div>}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3"><p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px]"><Sparkles size={12} />Suggested follow-ups</p><div className="grid gap-2 sm:flex sm:flex-wrap">{prompts.slice(0, 3).map(prompt => <SuggestionChip prompt={prompt} disabled={typing} onSelect={() => void send(prompt)} key={prompt}/>)}</div></div>
            <form onSubmit={event => { event.preventDefault(); void send(); }} className="rounded-xl border border-slate-300 bg-white p-2 shadow-sm transition focus-within:border-[#6956e8] focus-within:ring-2 focus-within:ring-violet-100">
              <textarea ref={composerRef} value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} maxLength={4000} rows={2} className="block max-h-40 min-h-16 w-full resize-y border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400" placeholder="Ask a focused question about this decision…" aria-label="Ask the decision agent" />
              <div className="flex items-center justify-between gap-3 px-1 pb-1"><p className={`text-[10px] ${text.length > 3600 ? "font-bold text-amber-700" : "text-slate-400"}`}>{text.length > 3600 ? `${text.length}/4000 characters` : "Enter to send · Shift + Enter for a new line"}</p><div className="flex gap-2">{typing && <button onClick={stop} type="button" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-700 hover:bg-rose-50"><Square size={14} /> Stop</button>}<button disabled={!text.trim() || typing} className="grid h-9 w-10 place-items-center rounded-lg bg-[#6956e8] text-white transition hover:bg-[#5643d3] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400" aria-label="Send message"><Send size={16} /></button></div></div>
            </form>
          </div>
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <section className="card p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-extrabold text-slate-900">Recommendation</h2>{result && <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0f776e]">{result.confidence} confidence</span>}</div><p className="mt-4 text-sm font-semibold leading-6 text-slate-800">{result?.recommendedOption || "Run the agent to generate a case-specific recommendation."}</p>{result && <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">Built from the active case context and available evidence.</p>}<button onClick={saveRecommendation} disabled={!result || saved} className="btn btn-teal mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"><Save size={16} /> {saved ? "Saved to case memory" : "Save recommendation"}</button>{activeCase?.publicInsight && <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3"><p className="text-xs font-bold text-[#0f776e]">Public insight selected</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{activeCase.publicInsight.title}</p></div>}<button onClick={openInsightEditor} disabled={!result || typing || insightBusy} className="btn btn-secondary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"><Globe2 size={16}/>{activeCase?.publicInsight ? "Update public insight" : "Publish as public insight"}</button>{activeCase?.publicInsight && <button onClick={removeInsight} disabled={insightBusy} className="mt-3 w-full text-xs font-bold text-rose-700 disabled:opacity-50">Remove public insight</button>}{insightError && <p className="mt-3 text-xs leading-5 text-rose-700">{insightError}</p>}</section>
        <section className="card p-5"><h2 className="flex items-center gap-2 font-extrabold text-slate-900"><AlertCircle size={17} className="text-amber-600" />Detected risks</h2>{result?.risks?.length ? <ul className="mt-4 space-y-3">{result.risks.map((risk, index) => <li className="flex gap-3 text-sm leading-6 text-slate-600" key={risk}><span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-50 text-[10px] font-bold text-amber-700">{index + 1}</span>{risk}</li>)}</ul> : <p className="mt-3 text-sm leading-6 text-slate-500">Risks will appear after the first analysis.</p>}</section>
        <section className="card p-5"><h2 className="flex items-center gap-2 font-extrabold text-slate-900"><CheckCircle2 size={17} className="text-[#0f9f91]" />Action items</h2>{result?.actionItems?.length ? <ul className="mt-4 space-y-3">{result.actionItems.map(item => <li className="flex gap-2.5 text-sm leading-6 text-slate-600" key={item}><CheckCircle2 size={16} className="mt-1 shrink-0 text-[#0f9f91]" />{item}</li>)}</ul> : <p className="mt-3 text-sm leading-6 text-slate-500">Clear next steps will appear with the recommendation.</p>}</section>
      </aside>
    </div>}
    {insightEditorOpen && result && activeCase && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"><form onSubmit={publishInsight} className="card w-full max-w-2xl p-6" role="dialog" aria-modal="true" aria-labelledby="insight-title"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Owner-approved public content</p><h2 id="insight-title" className="mt-2 text-xl font-extrabold">Review the insight before publishing</h2></div><button type="button" onClick={() => setInsightEditorOpen(false)} aria-label="Close"><X size={19}/></button></div><p className="mt-3 text-sm leading-6 text-slate-600">Only the title and summary below will be shared. Your prompts, private conversation, evidence files, risks, and action items stay private.</p><label className="mt-5 grid gap-2 text-sm font-bold">Insight title<input required minLength={3} maxLength={120} value={insightTitle} onChange={event => setInsightTitle(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal"/></label><label className="mt-4 grid gap-2 text-sm font-bold">Public summary<textarea required minLength={20} maxLength={1500} rows={8} value={insightSummary} onChange={event => setInsightSummary(event.target.value)} className="rounded-lg border border-slate-300 p-3 font-normal leading-7"/></label><div className="mt-2 flex justify-between text-xs text-slate-400"><span>Review for private or sensitive information.</span><span>{insightSummary.length}/1500</span></div>{activeCase.visibility === "private" ? <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">This case is private, so the insight will be saved but not visible. Submit the case for public review from Manage cases when ready.</p> : <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">Publishing or changing this insight sends the public case to admin review. It will appear in Explore after approval.</p>}{insightError && <p role="alert" className="mt-4 text-sm text-rose-700">{insightError}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" disabled={insightBusy} onClick={() => setInsightEditorOpen(false)} className="btn btn-secondary">Cancel</button><button disabled={insightBusy || insightTitle.trim().length < 3 || insightSummary.trim().length < 20} className="btn btn-primary disabled:opacity-50">{insightBusy ? "Publishing…" : "Publish selected insight"}</button></div></form></div>}
  </div>;
}

function SuggestionChip({ prompt, disabled, onSelect }: { prompt: string; disabled: boolean; onSelect: () => void }) {
  const viewportRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [marqueeDistance, setMarqueeDistance] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => {
      const viewport = viewportRef.current;
      const measure = measureRef.current;
      const overflow = viewport && measure ? measure.scrollWidth - viewport.clientWidth : 0;
      setMarqueeDistance(media.matches && overflow > 0 ? overflow + 4 : 0);
    };
    const observer = new ResizeObserver(update);
    if (viewportRef.current) observer.observe(viewportRef.current);
    media.addEventListener("change", update);
    update();
    return () => { observer.disconnect(); media.removeEventListener("change", update); };
  }, [prompt]);

  const marqueeDuration = Math.max(18, Math.min(28, marqueeDistance / 10 + 14));

  return <button type="button" title={prompt} aria-label={prompt} disabled={disabled} onClick={onSelect} className="suggestion-chip relative min-w-0 overflow-hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-[11px] font-semibold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-[#5643d3] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:max-w-full sm:text-xs">
    <span ref={viewportRef} className="block min-w-0 overflow-hidden whitespace-nowrap">
      {marqueeDistance > 0 ? <span className="suggestion-marquee-track" style={{ "--marquee-distance": `${marqueeDistance}px`, "--marquee-duration": `${marqueeDuration}s` } as React.CSSProperties}>{prompt}</span> : <span className="block truncate">{prompt}</span>}
    </span>
    <span ref={measureRef} aria-hidden="true" className="pointer-events-none absolute whitespace-nowrap opacity-0">{prompt}</span>
  </button>;
}
