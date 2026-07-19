import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const serverUrl = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000").replace(/\/$/, "");
const requestHeadersToForward = ["accept", "authorization", "content-type", "cookie"];
const responseHeadersToForward = ["cache-control", "content-disposition", "content-type", "location"];

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  if (!path.length || path[0] !== "api") return Response.json({ message: "Not found" }, { status: 404 });

  const target = new URL(`/${path.map(segment => encodeURIComponent(segment)).join("/")}`, serverUrl);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of requestHeadersToForward) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const method = request.method.toUpperCase();
  const upstream = await fetch(target, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  for (const name of responseHeadersToForward) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  const getSetCookie = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const cookies = getSetCookie?.call(upstream.headers) || [];
  if (cookies.length) {
    for (const cookie of cookies) responseHeaders.append("set-cookie", cookie);
  } else {
    const cookie = upstream.headers.get("set-cookie");
    if (cookie) responseHeaders.append("set-cookie", cookie);
  }

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
