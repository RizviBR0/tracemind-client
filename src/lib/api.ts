export type User = { id: string; name: string; email: string; role: "user" | "admin" };

const serverUrl = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000").replace(/\/$/, "");
export const apiUrl = (process.env.NEXT_PUBLIC_API_URL || `${serverUrl}/api/v1`).replace(/\/$/, "");
export const googleLoginUrl = `${serverUrl}/api/auth/google`;

export class ApiError extends Error {
  constructor(message: string, public status: number, public issues?: unknown) {
    super(message);
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`${serverUrl}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({ message: "The server returned an invalid response." }));
  if (!response.ok) throw new ApiError(data.message || "Request failed", response.status, data.issues);
  return data as T;
}
