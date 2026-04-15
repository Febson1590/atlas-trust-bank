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

function log(...args: unknown[]) {
  // Prefixed so it's easy to grep in server logs
  console.log("[proxy]", ...args);
}

export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  // Allow API routes, static assets, Next internals, and files with extensions.
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

  // Auth routes (login, register, etc.) — must be reachable by guests.
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    // Heuristic: if the user is being sent here FROM a protected route that
    // failed its session check (via ?redirect=... or ?error=...), then the
    // cookie they carry is stale. Clearing it here breaks the infinite
    // /login → /dashboard → /login loop that otherwise locks users out.
    const bounceIndicator =
      searchParams.has("redirect") || searchParams.has("error");

    if (sessionToken && bounceIndicator) {
      log(
        `clearing stale session cookie on ${pathname} (bounce from protected route)`
      );
      const response = NextResponse.next();
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    // Normal case: logged-in user navigates to /login — send them to dashboard.
    if (sessionToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Guest hitting login/register — allow through.
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
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on every route EXCEPT: API, Next internals, and static assets.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
