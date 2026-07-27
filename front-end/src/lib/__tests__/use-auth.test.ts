/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/use-auth.ts
 *
 * Purpose
 * -------
 * Verify that the useAuth custom hook accurately computes and synchronizes
 * user authentication status, role, roles list, and user object based on
 * auth storage states and window events.
 *
 * Tested Features
 * ---------------
 * ✓ Initial authentication status calculation
 * ✓ Event listener attachment and cleanup ("storage", "auth-updated")
 * ✓ Role and fallback roles array derivation
 * ✓ Synchronized state updates when auth storage changes
 *
 * Covered Scenarios
 * -----------------
 * ✓ Authenticated user with explicit roles
 * ✓ Authenticated user with single role fallback
 * ✓ Unauthenticated state (no token, no user)
 * ✓ Storage event trigger
 * ✓ Custom "auth-updated" event trigger
 *
 * Mocked Dependencies
 * -------------------
 * - src/lib/auth-storage (getAuthToken, getStoredUser)
 *
 * Not Covered
 * -----------
 * - Network session expiration
 * - Cookies-based middleware auth
 *
 * Notes
 * -----
 * Unit test for React hook using renderHook from @testing-library/react.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../use-auth";
import * as authStorage from "../auth-storage";

vi.mock("../auth-storage", () => ({
  getAuthToken: vi.fn(),
  getStoredUser: vi.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shouldReturnUnauthenticatedStateWhenNoTokenOrUserExists", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    vi.mocked(authStorage.getAuthToken).mockReturnValue(null);
    vi.mocked(authStorage.getStoredUser).mockReturnValue(null);

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useAuth());

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    expect(result.current).toEqual({
      isAuthenticated: false,
      role: null,
      roles: [],
      user: null,
    });

    // ----------------------------------------------------------------------------
    // Verify
    // Verify interaction with mocked dependencies.
    // ----------------------------------------------------------------------------
    expect(authStorage.getAuthToken).toHaveBeenCalledTimes(1);
    expect(authStorage.getStoredUser).toHaveBeenCalledTimes(1);
  });

  it("shouldReturnAuthenticatedStateWithExplicitRolesWhenUserHasRoles", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    const mockUser: authStorage.AuthUser = {
      id: "u-1",
      username: "admin_user",
      fullName: "Admin User",
      role: "ADMIN",
      roles: ["ADMIN", "LECTURER"],
    };
    vi.mocked(authStorage.getAuthToken).mockReturnValue("valid-token");
    vi.mocked(authStorage.getStoredUser).mockReturnValue(mockUser);

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useAuth());

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    expect(result.current).toEqual({
      isAuthenticated: true,
      role: "ADMIN",
      roles: ["ADMIN", "LECTURER"],
      user: mockUser,
    });

    // ----------------------------------------------------------------------------
    // Verify
    // Verify interaction with mocked dependencies.
    // ----------------------------------------------------------------------------
    expect(authStorage.getAuthToken).toHaveBeenCalledTimes(1);
  });

  it("shouldFallbackRolesArrayToSingleRoleWhenRolesPropertyIsMissing", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    const mockUser = {
      id: "u-2",
      username: "student_user",
      fullName: "Student User",
      role: "STUDENT" as authStorage.AuthRole,
    } as authStorage.AuthUser;
    vi.mocked(authStorage.getAuthToken).mockReturnValue("valid-token");
    vi.mocked(authStorage.getStoredUser).mockReturnValue(mockUser);

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useAuth());

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    expect(result.current.roles).toEqual(["STUDENT"]);
  });

  it("shouldUpdateStateWhenAuthUpdatedEventIsDispatched", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    vi.mocked(authStorage.getAuthToken).mockReturnValue(null);
    vi.mocked(authStorage.getStoredUser).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);

    const mockUser: authStorage.AuthUser = {
      id: "u-3",
      username: "updated_user",
      fullName: "Updated User",
      role: "STUDENT",
      roles: ["STUDENT"],
    };

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    vi.mocked(authStorage.getAuthToken).mockReturnValue("new-token");
    vi.mocked(authStorage.getStoredUser).mockReturnValue(mockUser);

    act(() => {
      window.dispatchEvent(new Event("auth-updated"));
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    expect(result.current).toEqual({
      isAuthenticated: true,
      role: "STUDENT",
      roles: ["STUDENT"],
      user: mockUser,
    });
  });

  it("shouldRemoveEventListenersOnUnmount", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    vi.mocked(authStorage.getAuthToken).mockReturnValue(null);
    vi.mocked(authStorage.getStoredUser).mockReturnValue(null);

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const { unmount } = renderHook(() => useAuth());
    unmount();

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    expect(removeEventListenerSpy).toHaveBeenCalledWith("storage", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("auth-updated", expect.any(Function));
  });
});
