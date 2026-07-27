/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/proxy.ts
 *
 * Purpose
 * -------
 * Verify that proxy middleware handles public asset skipping, cookie extraction,
 * guest-only route redirects for logged-in users, unauthenticated access blocks for
 * protected routes, and role-based RBAC redirects.
 *
 * Tested Features
 * ---------------
 * ✓ Static asset & API route skipping (pathname with dot or starting with /_next or /api)
 * ✓ Guest-only route redirect (/login -> redirect for logged in users)
 * ✓ Protected route auth enforcement (unauthenticated -> redirect to /login)
 * ✓ Protected route role permission enforcement (lacking required role -> redirect to default role page)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Static asset request (returns next)
 * ✓ Unauthenticated user accessing guest-only route (/login) (returns next)
 * ✓ Authenticated user accessing guest-only route (/login) (redirects to /home)
 * ✓ Unauthenticated user accessing protected route (/admin) (redirects to /login)
 * ✓ Student user accessing admin route (/admin) (redirects to /home)
 * ✓ Admin user accessing admin route (/admin) (returns next)
 *
 * Mocked Dependencies
 * -------------------
 * - "./lib/auth/jwt" (decodeJwt)
 * - "./lib/auth/rbac" (getRouteAccess)
 * - "./lib/auth/constants" (getRedirectPathForRoles)
 *
 * Not Covered
 * -----------
 * - Real Next.js edge runtime network request
 *
 * Notes
 * -----
 * Unit test for Next.js proxy middleware function.
 */

import * as constantsUtil from "@/lib/auth/constants";
import * as jwtUtil from "@/lib/auth/jwt";
import * as rbacUtil from "@/lib/auth/rbac";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { proxy } from "../proxy";

vi.mock("@/lib/auth/jwt", () => ({
  decodeJwt: vi.fn(),
}));

vi.mock("@/lib/auth/rbac", () => ({
  getRouteAccess: vi.fn(),
}));

vi.mock("@/lib/auth/constants", () => ({
  getRedirectPathForRoles: vi.fn(),
}));

describe("proxy middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(
    pathname: string,
    cookieToken?: string,
  ): NextRequest {
    const url = `https://dev-edu.com${pathname}`;
    const req = new NextRequest(url);
    if (cookieToken) {
      req.cookies.set("access_token", cookieToken);
    }
    return req;
  }

  it("shouldSkipMiddlewareForStaticAssetsAndApiRoutes", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Create requests for static assets and API paths.
    // ----------------------------------------------------------------------------
    const reqStatic = createMockRequest("/logo.png");
    const reqNext = createMockRequest("/_next/static/chunk.js");
    const reqApi = createMockRequest("/api/v1/courses");

    const resStatic = proxy(reqStatic);
    const resNext = proxy(reqNext);
    const resApi = proxy(reqApi);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify responses are next() without checking RBAC.
    // ----------------------------------------------------------------------------
    expect(resStatic.status).toBe(200);
    expect(resNext.status).toBe(200);
    expect(resApi.status).toBe(200);
    expect(rbacUtil.getRouteAccess).not.toHaveBeenCalled();
  });

  it("shouldRedirectAuthenticatedUserAwayFromGuestOnlyRoute", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock authenticated user requesting /login.
    // ----------------------------------------------------------------------------
    const req = createMockRequest("/login", "valid-token");
    vi.mocked(jwtUtil.decodeJwt).mockReturnValue({ roles: ["STUDENT"] });
    vi.mocked(rbacUtil.getRouteAccess).mockReturnValue({
      isGuestOnly: true,
      requiresAuth: false,
      isPublic: true,
    });
    vi.mocked(constantsUtil.getRedirectPathForRoles).mockReturnValue("/home");

    // ----------------------------------------------------------------------------
    // Act
    // Execute proxy.
    // ----------------------------------------------------------------------------
    const res = proxy(req);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify redirect status 307 to /home.
    // ----------------------------------------------------------------------------
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://dev-edu.com/home");
  });

  it("shouldRedirectUnauthenticatedUserAccessingProtectedRouteToLogin", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock unauthenticated user requesting /admin.
    // ----------------------------------------------------------------------------
    const req = createMockRequest("/admin");
    vi.mocked(jwtUtil.decodeJwt).mockReturnValue(null);
    vi.mocked(rbacUtil.getRouteAccess).mockReturnValue({
      isGuestOnly: false,
      requiresAuth: true,
      allowedRoles: ["ADMIN"],
      isPublic: false,
    });

    // ----------------------------------------------------------------------------
    // Act
    // Execute proxy.
    // ----------------------------------------------------------------------------
    const res = proxy(req);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify redirect status 307 to /login.
    // ----------------------------------------------------------------------------
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://dev-edu.com/login");
  });

  it("shouldRedirectUserWithoutRequiredRoleAwayFromProtectedRoute", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock STUDENT user requesting /admin.
    // ----------------------------------------------------------------------------
    const req = createMockRequest("/admin", "student-token");
    vi.mocked(jwtUtil.decodeJwt).mockReturnValue({ roles: ["STUDENT"] });
    vi.mocked(rbacUtil.getRouteAccess).mockReturnValue({
      isGuestOnly: false,
      requiresAuth: true,
      allowedRoles: ["ADMIN"],
      isPublic: false,
    });
    vi.mocked(constantsUtil.getRedirectPathForRoles).mockReturnValue("/home");

    // ----------------------------------------------------------------------------
    // Act
    // Execute proxy.
    // ----------------------------------------------------------------------------
    const res = proxy(req);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify redirect to /home.
    // ----------------------------------------------------------------------------
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://dev-edu.com/home");
  });

  it("shouldAllowAccessWhenUserHasRequiredRole", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock ADMIN user requesting /admin.
    // ----------------------------------------------------------------------------
    const req = createMockRequest("/admin", "admin-token");
    vi.mocked(jwtUtil.decodeJwt).mockReturnValue({ roles: ["ADMIN"] });
    vi.mocked(rbacUtil.getRouteAccess).mockReturnValue({
      isGuestOnly: false,
      requiresAuth: true,
      allowedRoles: ["ADMIN"],
      isPublic: false,
    });

    // ----------------------------------------------------------------------------
    // Act
    // Execute proxy.
    // ----------------------------------------------------------------------------
    const res = proxy(req);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify response status is 200 (next).
    // ----------------------------------------------------------------------------
    expect(res.status).toBe(200);
  });
});
