import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "./lib/auth/jwt";
import { getRouteAccess } from "./lib/auth/rbac";
import { getRedirectPathForRoles } from "./lib/auth/constants";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets or public media requests to avoid running auth logic on them
  if (
    pathname.includes(".") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get("access_token")?.value;
  const decoded = token ? decodeJwt(token) : null;
  const isAuthenticated = !!decoded;
  const roles = decoded?.roles || [];

  // Get access details for the current path
  const access = getRouteAccess(pathname);

  // 1. Guest Only Routes (/login, /register)
  if (access.isGuestOnly) {
    if (isAuthenticated) {
      const redirectPath = getRedirectPathForRoles(roles);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  // 2. Authenticated/Protected Routes
  if (access.requiresAuth) {
    if (!isAuthenticated) {
      // Redirect to login page if they try to access a protected page unauthenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role verification
    if (access.allowedRoles && access.allowedRoles.length > 0) {
      const hasPermission = roles.some((role) =>
        access.allowedRoles!.includes(role)
      );

      if (!hasPermission) {
        // If not authorized, redirect to their role default page, or fallback to /home
        const redirectPath = getRedirectPathForRoles(roles);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
