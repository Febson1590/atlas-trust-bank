import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/services",
  "/contact",
  "/terms",
  "/privacy",
];

// Routes for unauthenticated users only (login, register, etc.)
const authRoutes = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

const SESSION_COOKIE = "atlas_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  // Allow API routes, static files, etc.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public routes — always accessible
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Auth routes — redirect to dashboard if already logged in
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (sessionToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Dashboard routes — require session cookie
  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Admin routes — require session cookie (role check happens in admin layout)
  if (pathname.startsWith("/admin")) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
