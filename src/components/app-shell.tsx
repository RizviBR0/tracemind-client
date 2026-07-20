"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrainCircuit, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/app-providers";

const publicLinks = [["Home", "/"], ["Explore", "/explore"], ["About", "/about"], ["Help", "/help"]];
const signedLinks = [["Workspace", "/workspace"], ["Add case", "/items/add"], ["Manage cases", "/items/manage"], ["Dashboard", "/dashboard"]];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const links = [...publicLinks, ...(user ? signedLinks : [])];

  async function signOut() {
    await logout();
    setAccountOpen(false);
    router.push("/");
    router.refresh();
  }

  return <>
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <nav className="shell flex h-16 items-center justify-between gap-4" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#6956e8] text-white"><BrainCircuit size={19}/></span>
          TraceMind
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map(([name, href]) => <Link key={href} href={href} className={`rounded-md px-3 py-2 text-sm font-semibold ${path === href ? "bg-violet-50 text-[#6956e8]" : "text-slate-600 hover:text-slate-900"}`}>{name}</Link>)}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          {!loading && user ? <div className="relative">
            <button onClick={() => setAccountOpen(!accountOpen)} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-slate-50" aria-expanded={accountOpen}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-100 text-xs text-[#6956e8]">{user.name.charAt(0).toUpperCase()}</span>
              {user.name}<ChevronDown size={15}/>
            </button>
            {accountOpen && <div className="card absolute right-0 top-12 w-52 p-2 shadow-lg">
              <Link onClick={() => setAccountOpen(false)} href="/profile" className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-slate-50">Profile</Link>
              {user.role === "admin" && <Link onClick={() => setAccountOpen(false)} href="/admin" className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-slate-50">Administration</Link>}
              <button onClick={signOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"><LogOut size={15}/> Log out</button>
            </div>}
          </div> : !loading && <>
            <Link href="/login" className="btn btn-secondary text-sm">Log in</Link>
            <Link href="/register" className="btn btn-primary text-sm">Create account</Link>
          </>}
        </div>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>
      </nav>
      {open && <div className="border-t border-slate-200 bg-white px-4 pb-4 lg:hidden">
        {links.map(([name, href]) => <Link onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-semibold" key={href} href={href}>{name}</Link>)}
        {user ? <><Link onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-semibold" href="/profile">Profile</Link><button onClick={signOut} className="block w-full rounded-md px-3 py-3 text-left text-sm font-semibold text-rose-700">Log out</button></> : <><Link href="/login" className="block px-3 py-3 font-semibold">Log in</Link><Link href="/register" className="block px-3 py-3 font-semibold text-[#6956e8]">Create account</Link></>}
      </div>}
    </header>
    <main id="main-content">{children}</main>
    <Footer/>
  </>;
}

function Footer() {
  return <footer className="mt-20 border-t border-slate-200 bg-white">
    <div className="shell grid gap-10 py-12 md:grid-cols-[2fr_1fr_1fr]">
      <div><p className="flex items-center gap-2 font-extrabold"><BrainCircuit size={19} className="text-[#6956e8]"/> TraceMind</p><p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">Decision intelligence for teams that need to turn evidence into a confident next step.</p><a className="mt-3 inline-block text-sm text-slate-600 hover:text-[#6956e8]" href="mailto:hello@tracemind.app">hello@tracemind.app</a></div>
      <nav aria-label="Explore links"><p className="font-bold">Explore</p><div className="mt-3 grid gap-2 text-sm text-slate-500"><Link href="/explore">Public cases</Link><Link href="/about">About TraceMind</Link><Link href="/help">Help centre</Link></div></nav>
      <nav aria-label="Trust links"><p className="font-bold">Trust</p><div className="mt-3 grid gap-2 text-sm text-slate-500"><Link href="/privacy">Privacy</Link><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></div></nav>
    </div>
    <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-500">© 2026 TraceMind. Built for thoughtful decisions.</div>
  </footer>;
}
