/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/logout/actions.ts
 *
 * Purpose
 * -------
 * Verify that logoutAction Next.js Server Action invokes clearAuthCookies to remove
 * authentication cookies from the HTTP response store and returns a success payload.
 *
 * Tested Features
 * ---------------
 * ✓ Server Action invocation of clearAuthCookies
 * ✓ Return payload { success: true }
 *
 * Covered Scenarios
 * -----------------
 * ✓ Successful server logout action execution
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/auth/cookies" (clearAuthCookies)
 *
 * Not Covered
 * -----------
 * - HTTP response headers setting
 *
 * Notes
 * -----
 * Unit test for logoutAction Server Action.
 */

import * as cookiesAuth from "@/lib/auth/cookies";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logoutAction } from "../actions";

vi.mock("@/lib/auth/cookies", () => ({
  clearAuthCookies: vi.fn(),
}));

describe("logoutAction Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldInvokeClearAuthCookiesAndReturnSuccessResult", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock clearAuthCookies resolution.
    // ----------------------------------------------------------------------------
    vi.mocked(cookiesAuth.clearAuthCookies).mockResolvedValue(undefined);

    // ----------------------------------------------------------------------------
    // Act
    // Invoke server action.
    // ----------------------------------------------------------------------------
    const result = await logoutAction();

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify clearAuthCookies was called and { success: true } is returned.
    // ----------------------------------------------------------------------------
    expect(cookiesAuth.clearAuthCookies).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });
});
