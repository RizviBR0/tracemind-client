"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, Eye, EyeOff, LoaderCircle, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/app-providers";

const demoCredentials = {
  email: process.env.NEXT_PUBLIC_DEMO_EMAIL || "",
  password: process.env.NEXT_PUBLIC_DEMO_PASSWORD || "",
};

export default function Login() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function authenticate(credentials = { email, password }) {
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await login(credentials);
      router.push("/workspace");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemoCredentials() {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError("");
    setNotice("Demo credentials filled. Select Log in to continue.");
  }

  return <div className="shell grid min-h-[calc(100svh-64px)] place-items-center py-10">
    <div className="card w-full max-w-md p-7">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-[#6956e8]"><BrainCircuit/></div>
      <h1 className="mt-5 text-2xl font-extrabold">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-500">Sign in to continue your decision work.</p>
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {notice && <p aria-live="polite" className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-[#0f776e]">{notice}</p>}
      <form className="mt-6 grid gap-4" onSubmit={event => { event.preventDefault(); void authenticate(); }}>
        <label className="grid gap-1.5 text-sm font-bold">Email<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal" placeholder="you@example.com"/></label>
        <label className="grid gap-1.5 text-sm font-bold">Password<div className="relative"><input required type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 font-normal" placeholder="Your password"/><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-slate-500" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
        <div className="flex justify-end text-sm"><Link className="text-[#6956e8]" href="/register">Create account</Link></div>
        <button disabled={submitting} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60" type="submit">{submitting ? <><LoaderCircle className="animate-spin" size={17}/> Signing in…</> : "Log in"}</button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200"/>or<span className="h-px flex-1 bg-slate-200"/></div>
      {demoCredentials.email && demoCredentials.password && <button type="button" disabled={submitting} onClick={fillDemoCredentials} className="btn btn-secondary w-full"><UserRoundCheck size={17}/> Use demo account</button>}
      <button type="button" disabled={submitting} onClick={loginWithGoogle} className={`btn btn-secondary w-full ${demoCredentials.email && demoCredentials.password ? "mt-3" : ""}`}>Continue with Google</button>
    </div>
  </div>;
}
