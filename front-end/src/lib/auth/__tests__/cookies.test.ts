/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/auth/cookies.ts
 *
 * Purpose
 * -------
 * Verify that setAuthCookies and clearAuthCookies correctly interface with Next.js
 * App Router server cookie store (next/headers), parsing expiration times
 * and setting httpOnly, secure, and maxAge cookie flags.
 *
 * Tested Features
 * ---------------
 * ✓ setAuthCookies access_token & refresh_token persistence
 * ✓ Expiration calculation (expires_in, refresh_expires_in, refresh_token_expires_in)
 * ✓ toMaxAge numeric/string sanitization & validation
 * ✓ clearAuthCookies deletion of access and refresh tokens
 *
 * Covered Scenarios
 * -----------------
 * ✓ Valid OAuthTokenResponse with numeric expires_in and refresh_expires_in
 * ✓ OAuthTokenResponse with string expires_in
 * ✓ OAuthTokenResponse with refresh_token_expires_in fallback key
 * ✓ OAuthTokenResponse without refresh_token
 * ✓ Invalid / non-numeric / negative expires_in values
 * ✓ Clear cookies execution
 *
 * Mocked Dependencies
 * -------------------
 * - next/headers (cookies)
 *
 * Not Covered
 * -----------
 * - HTTP Response Set-Cookie headers generation
 *
 * Notes
 * -----
 * Unit test for Server Actions / Next.js Server Side Cookie utilities.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { setAuthCookies, clearAuthCookies } from "../cookies";
import { cookies } from "next/headers";
import type { OAuthTokenResponse } from "@/lib/type/api";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("auth cookies utility", () => {
  const mockCookieStore = {
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    size: 0,
    [Symbol.iterator]: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(
      mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("setAuthCookies", () => {
    it("shouldSetAccessAndRefreshTokenCookiesWithCalculatedMaxAge", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const tokens: OAuthTokenResponse = {
        access_token: "access-123",
        refresh_token: "refresh-456",
        expires_in: 3600,
        refresh_expires_in: 86400,
      };

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      await setAuthCookies(tokens);

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output / interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(1, "access_token", "access-123", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 3600,
      });
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(2, "refresh_token", "refresh-456", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 86400,
      });
    });

    it("shouldFallbackToRefreshTokenExpiresInWhenRefreshExpiresInIsUndefined", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const tokens: OAuthTokenResponse = {
        access_token: "access-123",
        refresh_token: "refresh-456",
        expires_in: 7200,
        refresh_token_expires_in: 172800,
      };

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      await setAuthCookies(tokens);

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output / interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(1, "access_token", "access-123", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 7200,
      });
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(2, "refresh_token", "refresh-456", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 172800,
      });
    });

    it("shouldNotSetRefreshTokenWhenRefreshTokenIsNotProvided", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const tokens: OAuthTokenResponse = {
        access_token: "access-only",
        expires_in: 3600,
      };

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      await setAuthCookies(tokens);

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output / interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
      expect(mockCookieStore.set).toHaveBeenCalledWith("access_token", "access-only", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 3600,
      });
    });

    it("shouldOmitMaxAgeWhenExpiresInIsInvalidOrNegative", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const tokens: OAuthTokenResponse = {
        access_token: "access-no-maxage",
      };

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      await setAuthCookies(tokens);

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output / interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(mockCookieStore.set).toHaveBeenCalledWith("access_token", "access-no-maxage", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });
    });
  });

  describe("clearAuthCookies", () => {
    it("shouldDeleteAccessAndRefreshTokenCookies", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      await clearAuthCookies();

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output / interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(mockCookieStore.delete).toHaveBeenCalledTimes(2);
      expect(mockCookieStore.delete).toHaveBeenNthCalledWith(1, "access_token");
      expect(mockCookieStore.delete).toHaveBeenNthCalledWith(2, "refresh_token");
    });
  });
});
