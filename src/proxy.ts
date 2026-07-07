import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, SPONSOR_SESSION_COOKIE_NAME } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/about", "/sponsor/login", "/sponsor/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/sponsor/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublic) return NextResponse.next();

  if (pathname.startsWith("/sponsor") || pathname.startsWith("/api/sponsor")) {
    const hasSponsorSession = request.cookies.has(SPONSOR_SESSION_COOKIE_NAME);
    if (!hasSponsorSession) {
      const loginUrl = new URL("/sponsor/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
