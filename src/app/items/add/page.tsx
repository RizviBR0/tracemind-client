"use client";

import { useRouter } from "next/navigation";
import { LoaderCircle, Upload } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import type { ApiCase } from "@/types/case";

const splitList = (value: FormDataEntryValue | null) => String(value || "").split(",").map(item => item.trim()).filter(Boolean);

export default function AddCase() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setProgress(15);
    const form = new FormData(event.currentTarget);
    let created: ApiCase;
    try {
      const coverImage = String(form.get("coverImage") || "").trim();
      created = await api<ApiCase>("/api/v1/cases", {
        method: "POST",
        body: JSON.stringify({
          title: String(form.get("title") || "").trim(),
          shortDescription: String(form.get("shortDescription") || "").trim(),
          fullDescription: String(form.get("fullDescription") || "").trim(),
          category: String(form.get("category") || ""),
          priority: String(form.get("priority") || "Medium"),
          targetDate: String(form.get("targetDate") || "") || undefined,
          goals: splitList(form.get("goals")),
          constraints: splitList(form.get("constraints")),
          tags: splitList(form.get("tags")),
          visibility: String(form.get("visibility") || "private"),
          ...(coverImage ? { coverImage } : {}),
        }),
      });
    } catch (err) {
      showErrorToast(err, "Couldn’t create the case. Try again.");
      setSubmitting(false);
      setProgress(0);
      return;
    }

    try {
      setProgress(55);
      const files = form.getAll("documents").filter(value => value instanceof File && value.size > 0) as File[];
      if (files.length) {
        const uploadBody = new FormData();
        uploadBody.set("caseId", created._id);
        files.forEach(file => uploadBody.append("files", file));
        const documents = await api<Array<{ _id: string }>>("/api/v1/documents/upload", { method: "POST", body: uploadBody });
        setProgress(75);
        const processing = await Promise.allSettled(documents.map(document => api(`/api/v1/documents/${document._id}/process`, { method: "POST" })));
        const failed = processing.find(result => result.status === "rejected");
        if (failed?.status === "rejected") showErrorToast(failed.reason, "Case created, but some documents need attention.");
      }
      setProgress(100);
      showSuccessToast("Case created successfully.");
      router.push("/items/manage?created=1");
      router.refresh();
    } catch (err) {
      showErrorToast(err, "Case created, but documents need attention.");
      setSubmitting(false);
    }
  }

  return <div className="shell max-w-4xl py-10">
    <p className="eyebrow">New knowledge case</p>
    <h1 className="mt-2 text-3xl font-extrabold">Start with the decision that needs clarity.</h1>
    <p className="mt-3 text-slate-600">The stronger the context, the more useful the recommendation.</p>
    <form onSubmit={submit} className="card mt-8 grid gap-5 p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="title" label="Case title" minLength={5} required/>
        <Select name="category" label="Category" options={["Technology", "Product", "People", "UX Research", "Strategy"]}/>
        <Select name="priority" label="Priority" options={["High", "Medium", "Low"]}/>
        <Field name="targetDate" label="Target date" type="date"/>
      </div>
      <Field name="shortDescription" label="Short description" minLength={20} required/>
      <label className="grid gap-1.5 text-sm font-bold">Full problem description<textarea name="fullDescription" required minLength={50} rows={6} className="rounded-lg border border-slate-300 p-3 font-normal" placeholder="Describe the problem, what has been tried and why it matters."/></label>
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="goals" label="Goals (separate with commas)"/>
        <Field name="constraints" label="Constraints (separate with commas)"/>
        <Field name="tags" label="Tags (separate with commas)"/>
        <Field name="coverImage" label="Cover image URL" type="url"/>
      </div>
      <label className="grid gap-2 text-sm font-bold">Supporting documents
        <span className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm font-normal text-slate-500"><Upload className="mx-auto mb-2 text-[#6956e8]" size={22}/>PDF, DOCX, TXT, PNG or JPG · up to 10MB each<input name="documents" className="mt-3 block w-full text-xs" multiple type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"/></span>
      </label>
      <fieldset className="rounded-xl border border-slate-200 p-4 text-sm"><legend className="px-1 font-bold">Visibility</legend><div className="mt-1 flex flex-wrap gap-5"><label className="flex items-center gap-2"><input defaultChecked name="visibility" value="private" type="radio"/> Private draft</label><label className="flex items-center gap-2"><input name="visibility" value="public" type="radio"/> Submit for public review</label></div><p className="mt-3 text-xs leading-5 text-slate-500">Public submissions are reviewed by an administrator before they appear in Explore. Your uploaded documents and private workspace conversation are never published.</p></fieldset>
      {submitting && <div><div className="mb-2 flex justify-between text-xs font-semibold text-slate-500"><span>Saving case and processing files</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#0f9f91] transition-all" style={{ width: `${progress}%` }}/></div></div>}
      <div className="flex justify-end gap-3"><button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancel</button><button disabled={submitting} className="btn btn-primary disabled:opacity-60">{submitting ? <><LoaderCircle className="animate-spin" size={17}/> Creating…</> : "Create case"}</button></div>
    </form>
  </div>;
}

function Field({ name, label, type = "text", required = false, minLength }: { name: string; label: string; type?: string; required?: boolean; minLength?: number }) {
  return <label className="grid gap-1.5 text-sm font-bold">{label}<input name={name} required={required} minLength={minLength} type={type} className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal"/></label>;
}
function Select({ name, label, options }: { name: string; label: string; options: string[] }) {
  return <label className="grid gap-1.5 text-sm font-bold">{label}<select name={name} className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal">{options.map(option => <option key={option}>{option}</option>)}</select></label>;
}
