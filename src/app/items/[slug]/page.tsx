import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Eye, Star } from "lucide-react";
import { CaseActions } from "@/components/case-actions";
import { CaseCard } from "@/components/case-card";
import { ReviewForm } from "@/components/review-form";
import type { PublicCaseDetails } from "@/types/case";

export const dynamic = "force-dynamic";

const serverUrl = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000").replace(/\/$/, "");

async function getCase(slug: string): Promise<PublicCaseDetails | null> {
  const response = await fetch(`${serverUrl}/api/v1/cases/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Unable to load this case.");
  return response.json() as Promise<PublicCaseDetails>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCase(slug);
  if (!data) return { title: "Case not found" };
  const { item } = data;
  return {
    title: item.title,
    description: item.shortDescription.slice(0, 160),
    openGraph: {
      title: item.title,
      description: item.shortDescription.slice(0, 160),
      type: "article",
      ...(item.coverImage ? { images: [{ url: item.coverImage }] } : {}),
    },
    twitter: {
      card: item.coverImage ? "summary_large_image" : "summary",
      title: item.title,
      description: item.shortDescription.slice(0, 160),
    },
  };
}

export default async function Details({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCase(slug);
  if (!data) notFound();
  const { item, related, reviews } = data;

  return <main className="shell py-10 sm:py-14">
    <div className="text-sm text-slate-500"><Link className="hover:text-[#6956e8]" href="/explore">Explore</Link> / {item.category}</div>
    <div className="mt-5 grid gap-10 lg:grid-cols-[1.35fr_.65fr]">
      <div>
        {item.coverImage
          ? <img src={item.coverImage} alt="" className="h-64 w-full rounded-xl object-cover sm:h-80" />
          : <div className="flex h-64 w-full items-end rounded-xl bg-[#101a33] p-7 text-2xl font-extrabold text-white sm:h-80">{item.category}</div>}
        <div className="mt-6 flex flex-wrap gap-2">{item.tags.map(tag => <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-[#6956e8]" key={tag}>{tag}</span>)}</div>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{item.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{item.shortDescription}</p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
          <p className="mt-3 leading-7 text-slate-600">{item.fullDescription}</p>
          <h2 className="mt-10 text-2xl font-bold text-slate-900">Goals and constraints</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="card p-5"><h3 className="font-bold">Goals</h3>{item.goals.length ? <ul className="mt-3 space-y-2 text-sm text-slate-600">{item.goals.map(goal => <li key={goal}>• {goal}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No goals have been published.</p>}</div>
            <div className="card p-5"><h3 className="font-bold">Constraints</h3>{item.constraints.length ? <ul className="mt-3 space-y-2 text-sm text-slate-600">{item.constraints.map(constraint => <li key={constraint}>• {constraint}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No constraints have been published.</p>}</div>
          </div>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-extrabold uppercase tracking-wider text-[#0f9f91]">Shared intentionally by the case owner</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Public AI insight</h2></div></div>
          {item.publicInsight?.title && item.publicInsight?.summary
            ? <div className="card mt-4 border-l-4 border-l-[#0f9f91] p-5"><p className="font-bold">{item.publicInsight.title}</p><p className="mt-2 leading-7 text-slate-600">{item.publicInsight.summary}</p><p className="mt-4 text-xs leading-5 text-slate-400">AI-assisted analysis selected and reviewed by the case owner. Private workspace messages and source files are not included.</p></div>
            : <div className="card mt-4 p-5 text-sm text-slate-500">No public AI insight has been published for this case.</div>}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">{item.priority} priority</span><span className="text-sm text-slate-500">{item.status}</span></div>
          <div className="mt-5 grid gap-3 text-sm text-slate-600">
            <p className="flex items-center gap-2"><Star size={16} className={item.reviewCount ? "fill-amber-400 text-amber-400" : "text-slate-400"} />{item.reviewCount ? `${item.averageRating.toFixed(1)} average from ${item.reviewCount} review${item.reviewCount === 1 ? "" : "s"}` : "Not rated yet"}</p>
            <p className="flex items-center gap-2"><Eye size={16} />{item.viewCount} view{item.viewCount === 1 ? "" : "s"}</p>
            <p className="flex items-center gap-2"><CalendarDays size={16} />{new Date(item.createdAt).toLocaleDateString()}</p>
          </div>
          <CaseActions slug={item.slug} title={item.title} />
        </div>
        <div className="card p-5"><p className="font-bold">Published by</p><p className="mt-2 text-sm text-slate-600">{item.ownerId?.name || "TraceMind contributor"}</p><p className="mt-1 text-xs text-slate-500">Public decision contributor</p></div>
        <div className="card p-5">
          <p className="font-bold">Community reviews</p>
          {reviews.length ? <div className="mt-4 space-y-4">{reviews.slice(0, 4).map(review => <div className="border-t border-slate-100 pt-4 first:border-0 first:pt-0" key={review._id}><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">{review.userId?.name || "TraceMind user"}</span><span className="text-sm text-amber-600">{review.rating}/5</span></div><p className="mt-1 text-sm leading-6 text-slate-600">{review.comment}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No reviews yet.</p>}
          <ReviewForm caseId={item._id} slug={item.slug} />
        </div>
      </aside>
    </div>

    <section className="mt-16 border-t border-slate-200 pt-12">
      <h2 className="text-2xl font-extrabold">Related cases</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Matched using shared category, tags, and meaningful terms in each approved public case.</p>
      {related.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map(entry => <CaseCard item={entry} key={entry._id} />)}</div> : <p className="mt-4 text-slate-500">No related public cases are available.</p>}
    </section>
  </main>;
}
