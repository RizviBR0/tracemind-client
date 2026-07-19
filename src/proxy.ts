import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/workspace", "/items/add", "/items/manage", "/dashboard", "/profile", "/admin"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;
  const requiresAuthentication = protectedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));

  if (requiresAuthentication && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace/:path*", "/items/add/:path*", "/items/manage/:path*", "/dashboard/:path*", "/profile/:path*", "/admin/:path*", "/login", "/register"],
};
