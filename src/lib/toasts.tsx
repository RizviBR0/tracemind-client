"use client";

import { toast } from "react-toastify";
import { ApiError } from "@/lib/api";

function isAiLimitError(error: unknown) {
  return (error instanceof ApiError && error.status === 429) || error instanceof Error && /rate.?limit|quota|AI limit reached|\(429\)/i.test(error.message);
}

function conciseMessage(error: unknown, fallback: string) {
  if (isAiLimitError(error)) return "AI limit reached. Add your own key to continue.";
  if (error instanceof ApiError && error.status === 413) return "The file is too large.";
  if (error instanceof ApiError && error.status === 401) return "Please sign in again.";
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return error.message.length <= 90 ? error.message : fallback;
  return fallback;
}

export function showErrorToast(error: unknown, fallback: string) {
  const aiLimit = isAiLimitError(error);
  toast.error(<div className="flex items-center gap-3"><span className="min-w-0 flex-1">{conciseMessage(error, fallback)}</span>{aiLimit && <button type="button" onClick={(event) => { event.stopPropagation(); window.location.assign("/profile#ai-access"); }} className="shrink-0 rounded-md border border-rose-200 bg-transparent px-2 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-50">Update AI key</button>}</div>, { toastId: aiLimit ? "ai-limit" : undefined });
}

export function showSuccessToast(message: string) {
  toast.success(message);
}
