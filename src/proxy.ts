import { NextResponse, type NextRequest } from "next/server";

// Optimistic route guard: redirects visitors without a session cookie away from
// private areas. Real authorization (signature, role, account status) happens
// server-side in layouts and every server action via src/lib/auth/session.ts.

const PRIVATE_PREFIXES = ["/dashboard", "/profile", "/settings", "/admin", "/checkout"];
const SESSION_COOKIE = "marketin_session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*", "/admin/:path*", "/checkout/:path*"],
};
