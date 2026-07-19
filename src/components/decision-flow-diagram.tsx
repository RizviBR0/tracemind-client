import { ArrowDown, ArrowRight, BrainCircuit, CheckCircle2, FileSearch, FolderKanban, Scale } from "lucide-react";

export function DecisionFlowDiagram() {
  return <div className="card mx-auto w-full max-w-2xl overflow-hidden bg-white" aria-label="Evidence to action decision workflow">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
      <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-[#6956e8]"><BrainCircuit size={19} /></span><div><p className="text-sm font-extrabold text-slate-900">Decision workflow</p><p className="text-[11px] text-slate-500">Reasoning stays connected to the work</p></div></div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0f776e]"><span className="h-1.5 w-1.5 rounded-full bg-[#0f9f91]" />Context attached</span>
    </div>

    <div className="bg-slate-50 px-5 py-6 sm:px-6 sm:py-8">
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,.95fr)_28px_minmax(0,1.05fr)_28px_minmax(0,1.05fr)] sm:gap-2">
        <FlowColumn label="Evidence">
          <MiniCard icon={<FileSearch size={16} />} title="Research notes" tone="teal" />
          <MiniCard icon={<FolderKanban size={16} />} title="Project context" tone="amber" />
        </FlowColumn>

        <FlowArrow />

        <FlowColumn label="Synthesis">
          <div className="rounded-xl bg-slate-900 p-4 text-white shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-[#a69af3]"><BrainCircuit size={17} /></span>
            <p className="mt-3 text-sm font-extrabold">TraceMind analysis</p>
            <div className="mt-3 space-y-2 text-[10px] text-slate-300"><p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf]" />Goals and constraints</p><p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24]" />Gaps and trade-offs</p></div>
          </div>
        </FlowColumn>

        <FlowArrow />

        <FlowColumn label="Decision">
          <div className="rounded-xl border border-violet-200 bg-white p-4 shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-[#6956e8]"><CheckCircle2 size={17} /></span>
            <p className="mt-3 text-sm font-extrabold text-slate-900">Reviewable next step</p>
            <p className="mt-2 text-[10px] leading-4 text-slate-500">Evidence links and assumptions remain visible.</p>
          </div>
        </FlowColumn>
      </div>
    </div>

    <div className="grid gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:grid-cols-3 sm:px-6">
      {["Evidence collected", "Options compared", "Action recorded"].map((step, index) => <div className="flex items-center gap-2" key={step}><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-extrabold ${index === 2 ? "bg-[#6956e8] text-white" : "bg-slate-100 text-slate-600"}`}>{index + 1}</span><span className="text-[10px] font-bold text-slate-600">{step}</span></div>)}
    </div>
  </div>;
}

function FlowColumn({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-2 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}{label === "Synthesis" && <Scale size={11} />}</p><div className="space-y-2">{children}</div></div>;
}

function FlowArrow() {
  return <div className="grid place-items-center text-slate-300"><ArrowRight className="hidden sm:block" size={18} /><ArrowDown className="sm:hidden" size={18} /></div>;
}

function MiniCard({ icon, title, tone }: { icon: React.ReactNode; title: string; tone: "teal" | "amber" }) {
  return <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone === "teal" ? "bg-teal-50 text-[#0f9f91]" : "bg-amber-50 text-amber-600"}`}>{icon}</span><p className="text-xs font-bold text-slate-800">{title}</p></div>;
}
