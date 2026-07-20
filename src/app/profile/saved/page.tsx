"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CaseCard, CardSkeleton } from "@/components/case-card";
import { HeartCrack } from "lucide-react";
import type { ApiCase } from "@/types/case";

export default function SavedCases() {
  const { data: cases, isLoading, isError, error } = useQuery({
    queryKey: ["saved-cases"],
    queryFn: () => api<ApiCase[]>("/api/v1/cases/saved/items")
  });

  return (
    <div className="shell py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Saved cases</h1>
      <p className="mt-2 text-slate-600">Cases you have saved for later.</p>

      {isLoading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {isError && (
        <div className="mt-8 card p-10 text-center">
          <p className="font-bold text-rose-700">{error.message}</p>
        </div>
      )}

      {!isLoading && !isError && cases && cases.length === 0 && (
        <div className="mt-8 card p-10 text-center">
          <HeartCrack className="mx-auto text-slate-400" size={40} />
          <h2 className="mt-4 font-bold text-slate-900">No saved cases</h2>
          <p className="mt-2 text-sm text-slate-500">You haven't saved any cases yet. Browse the public directory and click the save button on cases you want to keep track of.</p>
        </div>
      )}

      {!isLoading && !isError && cases && cases.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cases.map((item) => (
            <CaseCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
