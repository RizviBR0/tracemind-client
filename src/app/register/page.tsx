"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/app-providers";

export default function Register() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (name.length < 2) return setError("Enter your full name.");
    if (password.length < 8) return setError("Password must contain at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      await register({ name, email, password });
      router.push("/workspace");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="shell grid min-h-[calc(100svh-64px)] place-items-center py-10">
    <div className="card w-full max-w-md p-7">
      <BrainCircuit className="text-[#6956e8]"/>
      <h1 className="mt-5 text-2xl font-extrabold">Create your account</h1>
      <p className="mt-2 text-sm text-slate-500">Give your next important decision a durable record.</p>
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="grid gap-1 text-sm font-bold">Full name<input name="name" required autoComplete="name" className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Email<input name="email" required type="email" autoComplete="email" className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Password<input name="password" required minLength={8} type="password" autoComplete="new-password" className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal"/></label>
        <label className="grid gap-1 text-sm font-bold">Confirm password<input name="confirmPassword" required minLength={8} type="password" autoComplete="new-password" className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal"/></label>
        <label className="flex gap-2 text-sm text-slate-600"><input name="terms" required type="checkbox"/> I accept the <Link className="text-[#6956e8]" href="/privacy">privacy terms</Link>.</label>
        <button disabled={submitting} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <><LoaderCircle className="animate-spin" size={17}/> Creating account…</> : "Create account"}</button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200"/>or<span className="h-px flex-1 bg-slate-200"/></div>
      <button type="button" onClick={loginWithGoogle} className="btn btn-secondary w-full">Continue with Google</button>
      <p className="mt-5 text-center text-sm text-slate-500">Already have an account? <Link className="font-bold text-[#6956e8]" href="/login">Log in</Link></p>
    </div>
  </div>;
}
