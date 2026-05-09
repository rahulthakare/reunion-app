import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/admin", "/directory", "/fun-zone"];

// Specific protected article subpaths (the index + detail pages remain public)
const PROTECTED_ARTICLE_PATHS = ["/articles/new", "/articles/mine"];
const PROTECTED_ARTICLE_REGEX = /^\/articles\/[^/]+\/edit\/?$/;

// Routes accessible only when NOT logged in
const AUTH_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  const isProtectedRoute =
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PROTECTED_ARTICLE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    PROTECTED_ARTICLE_REGEX.test(pathname);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page.
  // Honor ?redirect= if it's a safe in-app path; otherwise send to home.
  // Also: refuse to bounce back to /login or to any URL that re-includes
  // a redirect=/login chain — prevents infinite loops if a downstream page
  // erroneously bounces back to /login.
  if (isAuthRoute && sessionCookie) {
    const requested = request.nextUrl.searchParams.get("redirect");
    const isSafe =
      requested &&
      requested.startsWith("/") &&
      !requested.startsWith("//") &&
      !requested.startsWith("/login");
    const target = isSafe ? requested! : "/";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
