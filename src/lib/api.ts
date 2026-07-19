export type User = { id: string; name: string; email: string; role: "user" | "admin" };

const apiProxyUrl = "/api/backend";
export const apiUrl = `${apiProxyUrl}/api/v1`;
export const googleLoginUrl = `${apiProxyUrl}/api/auth/google`;

export class ApiError extends Error {
  constructor(message: string, public status: number, public issues?: unknown) {
    super(message);
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`${apiProxyUrl}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({ message: "The server returned an invalid response." }));
  if (!response.ok) throw new ApiError(data.message || "Request failed", response.status, data.issues);
  return data as T;
}
