/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/auth/auth-sync.tsx
 *
 * Purpose
 * -------
 * Verify that AuthSync component synchronizes server cookie authentication token
 * state with browser localStorage auth session, refetches user profile (/api/v1/users/me),
 * decodes JWT roles, and clears storage when unauthenticated.
 *
 * Tested Features
 * ---------------
 * ✓ Session sync when serverToken differs from localStorage token
 * ✓ User profile fetching and JWT role decoding
 * ✓ Storage cleanup when serverToken is null but local token exists
 * ✓ No-op when local token and user match serverToken
 * ✓ Error handling via useApiWithToast on fetch error
 *
 * Covered Scenarios
 * -----------------
 * ✓ New serverToken provided (triggers fetchMe and setAuthSession)
 * ✓ ServerToken is null while local token exists (triggers clearAuthSession)
 * ✓ Matching local token and user (no sync action triggered)
 * ✓ Profile fetch error (triggers handleError)
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/auth-storage" (getAuthToken, getStoredUser, setAuthSession, clearAuthSession)
 * - "@/lib/api/users" (useMeQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "@/lib/auth/jwt" (decodeJwt)
 * - "@/lib/auth/constants" (getPrimaryRole)
 *
 * Not Covered
 * -----------
 * - Real API network request
 *
 * Notes
 * -----
 * Unit test for AuthSync client component.
 */

import * as usersApi from "@/lib/api/users";
import * as authStorage from "@/lib/auth-storage";
import * as authConstants from "@/lib/auth/constants";
import * as jwtUtil from "@/lib/auth/jwt";
import * as apiToast from "@/lib/use-api-with-toast";
import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthSync } from "../auth-sync";

vi.mock("@/lib/toast-context", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("@/lib/auth-storage", () => ({
  getAuthToken: vi.fn(),
  getStoredUser: vi.fn(),
  setAuthSession: vi.fn(),
  clearAuthSession: vi.fn(),
}));

vi.mock("@/lib/api/users", () => ({
  useMeQuery: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("@/lib/auth/jwt", () => ({
  decodeJwt: vi.fn(),
}));

vi.mock("@/lib/auth/constants", () => ({
  getPrimaryRole: vi.fn(),
}));

describe("AuthSync Component", () => {
  const mockFetchMe = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usersApi.useMeQuery).mockReturnValue({
      refetch: mockFetchMe,
    } as any);
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      handleError: mockHandleError,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shouldFetchMeAndSetAuthSessionWhenServerTokenDiffersFromLocalToken", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare local storage mocks and fetchMe resolved value.
    // ----------------------------------------------------------------------------
    vi.mocked(authStorage.getAuthToken).mockReturnValue("old-token");
    vi.mocked(authStorage.getStoredUser).mockReturnValue(null);

    const mockUserData = {
      id: "u-100",
      username: "alex_pro",
      fullName: "Alex Pro",
      role: "STUDENT",
      email: "alex@example.com",
      avatarUrl: "https://example.com/avatar.png",
    };

    mockFetchMe.mockResolvedValue({ data: mockUserData });
    vi.mocked(jwtUtil.decodeJwt).mockReturnValue({ roles: ["STUDENT"] });
    vi.mocked(authConstants.getPrimaryRole).mockReturnValue("STUDENT");

    // ----------------------------------------------------------------------------
    // Act
    // Render AuthSync with new serverToken.
    // ----------------------------------------------------------------------------
    render(<AuthSync serverToken="new-server-token" />);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify fetchMe was called and setAuthSession was invoked with user payload.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockFetchMe).toHaveBeenCalledTimes(1);
      expect(authStorage.setAuthSession).toHaveBeenCalledWith(
        "new-server-token",
        {
          id: "u-100",
          username: "alex_pro",
          fullName: "Alex Pro",
          role: "STUDENT",
          roles: ["STUDENT"],
          email: "alex@example.com",
          avatarUrl: "https://example.com/avatar.png",
        },
      );
    });
  });

  it("shouldClearAuthSessionWhenServerTokenIsNullAndLocalTokenExists", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare local token in storage.
    // ----------------------------------------------------------------------------
    vi.mocked(authStorage.getAuthToken).mockReturnValue("existing-token");

    // ----------------------------------------------------------------------------
    // Act
    // Render AuthSync with serverToken = null.
    // ----------------------------------------------------------------------------
    render(<AuthSync serverToken={null} />);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify clearAuthSession was invoked.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(authStorage.clearAuthSession).toHaveBeenCalledTimes(1);
    });
  });

  it("shouldDoNothingWhenLocalTokenAndStoredUserMatchServerToken", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare matching local token and stored user.
    // ----------------------------------------------------------------------------
    vi.mocked(authStorage.getAuthToken).mockReturnValue("same-token");
    vi.mocked(authStorage.getStoredUser).mockReturnValue({
      id: "user-1",
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render AuthSync with "same-token".
    // ----------------------------------------------------------------------------
    render(<AuthSync serverToken="same-token" />);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify fetchMe and setAuthSession were NOT invoked.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockFetchMe).not.toHaveBeenCalled();
      expect(authStorage.setAuthSession).not.toHaveBeenCalled();
    });
  });

  it("shouldHandleErrorWhenProfileFetchFails", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock fetchMe returning null data (error).
    // ----------------------------------------------------------------------------
    vi.mocked(authStorage.getAuthToken).mockReturnValue(null);
    mockFetchMe.mockResolvedValue({ data: null });

    // ----------------------------------------------------------------------------
    // Act
    // Render AuthSync with serverToken.
    // ----------------------------------------------------------------------------
    render(<AuthSync serverToken="valid-token" />);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify handleError was called.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        "Failed to sync profile",
      );
    });
  });
});
