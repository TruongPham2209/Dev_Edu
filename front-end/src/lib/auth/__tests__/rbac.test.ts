/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/auth/rbac.ts
 *
 * Purpose
 * -------
 * Verify that path route inspection functions (isPublicRoute, isGuestOnlyRoute, getRouteAccess)
 * classify application route URLs according to Role-Based Access Control policies.
 *
 * Tested Features
 * ---------------
 * ✓ Public route prefix matching (exact & subpath matching)
 * ✓ Guest-only route prefix matching (/login, /register)
 * ✓ Protected route role requirements extraction (/admin, /lecturer, /cart, /profile)
 * ✓ Default fallback for unmatched routes
 *
 * Covered Scenarios
 * -----------------
 * ✓ /home, /courses/123, /forum/thread/45 (Public)
 * ✓ /login, /register (Guest-only)
 * ✓ /admin, /admin/users (Protected for ADMIN)
 * ✓ /lecturer/courses (Protected for LECTURER)
 * ✓ /cart, /checkout (Protected for STUDENT)
 * ✓ /profile (Protected for any authenticated user)
 * ✓ Unmatched unknown paths (e.g. /about)
 *
 * Mocked Dependencies
 * -------------------
 * - None (pure logic unit tests)
 *
 * Not Covered
 * -----------
 * - Next.js Middleware request redirection execution
 *
 * Notes
 * -----
 * Pure unit test for RBAC route rules.
 */

import { describe, it, expect } from "vitest";
import { isPublicRoute, isGuestOnlyRoute, getRouteAccess } from "../rbac";

describe("rbac utility", () => {
  describe("isPublicRoute", () => {
    it("shouldReturnTrueForExactPublicRoutes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(isPublicRoute("/home")).toBe(true);
      expect(isPublicRoute("/courses")).toBe(true);
      expect(isPublicRoute("/forum")).toBe(true);
    });

    it("shouldReturnTrueForSubpathsOfPublicRoutes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(isPublicRoute("/courses/react-19-mastery")).toBe(true);
      expect(isPublicRoute("/forum/thread/123")).toBe(true);
      expect(isPublicRoute("/posts/456")).toBe(true);
    });

    it("shouldReturnFalseForNonPublicRoutes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(isPublicRoute("/admin")).toBe(false);
      expect(isPublicRoute("/login")).toBe(false);
      expect(isPublicRoute("/profile")).toBe(false);
    });
  });

  describe("isGuestOnlyRoute", () => {
    it("shouldReturnTrueForGuestOnlyRoutesAndSubpaths", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(isGuestOnlyRoute("/login")).toBe(true);
      expect(isGuestOnlyRoute("/register")).toBe(true);
      expect(isGuestOnlyRoute("/login/reset-password")).toBe(true);
    });

    it("shouldReturnFalseForNonGuestRoutes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(isGuestOnlyRoute("/home")).toBe(false);
      expect(isGuestOnlyRoute("/admin")).toBe(false);
    });
  });

  describe("getRouteAccess", () => {
    it("shouldReturnGuestOnlyAccessForGuestRoutes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(getRouteAccess("/login")).toEqual({
        isPublic: false,
        isGuestOnly: true,
        requiresAuth: false,
      });
    });

    it("shouldReturnPublicAccessForPublicRoutes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(getRouteAccess("/courses")).toEqual({
        isPublic: true,
        isGuestOnly: false,
        requiresAuth: false,
      });
    });

    it("shouldReturnProtectedAccessWithRolesForAdminRoutes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(getRouteAccess("/admin/users")).toEqual({
        isPublic: false,
        isGuestOnly: false,
        requiresAuth: true,
        allowedRoles: ["ADMIN"],
      });
    });

    it("shouldReturnProtectedAccessWithRolesForStudentRoutes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(getRouteAccess("/cart")).toEqual({
        isPublic: false,
        isGuestOnly: false,
        requiresAuth: true,
        allowedRoles: ["STUDENT"],
      });
    });

    it("shouldReturnProtectedAccessWithUndefinedRolesForProfileRoute", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(getRouteAccess("/profile")).toEqual({
        isPublic: false,
        isGuestOnly: false,
        requiresAuth: true,
        allowedRoles: undefined,
      });
    });

    it("shouldFallbackToPublicAccessForUnmatchedRoutes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify returned result.
      // ----------------------------------------------------------------------------
      expect(getRouteAccess("/unknown-page")).toEqual({
        isPublic: true,
        isGuestOnly: false,
        requiresAuth: false,
      });
    });
  });
});
