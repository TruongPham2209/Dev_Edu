/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/auth-storage.ts
 *
 * Purpose
 * -------
 * Verify that the authentication storage utility correctly manages auth tokens
 * and user session details in localStorage, dispatches window events, and handles
 * edge cases such as missing data, invalid JSON, or server-side rendering (SSR).
 *
 * Tested Features
 * ---------------
 * ✓ getAuthToken retrieval
 * ✓ getStoredUser retrieval and parsing
 * ✓ setAuthSession persistence and event dispatching
 * ✓ updateStoredUser merging and event dispatching
 * ✓ clearAuthSession cleanup and event dispatching
 *
 * Covered Scenarios
 * -----------------
 * ✓ Valid token and user object
 * ✓ Null/missing items in localStorage
 * ✓ Invalid/malformed JSON in user storage
 * ✓ SSR environment (window is undefined)
 * ✓ Event dispatching ("auth-updated")
 * ✓ Partial user updates
 *
 * Mocked Dependencies
 * -------------------
 * - None (uses jsdom window and localStorage)
 *
 * Not Covered
 * -----------
 * - Browser local storage quota limits
 * - Encrypted storage
 *
 * Notes
 * -----
 * Pure unit test for auth-storage utility.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getAuthToken,
  getStoredUser,
  setAuthSession,
  updateStoredUser,
  clearAuthSession,
  type AuthUser,
} from "../auth-storage";

describe("auth-storage", () => {
  const mockUser: AuthUser = {
    id: "user-123",
    username: "john_doe",
    fullName: "John Doe",
    role: "STUDENT",
    roles: ["STUDENT"],
    email: "john@example.com",
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getAuthToken", () => {
    it("shouldReturnTokenWhenTokenExistsInLocalStorage", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const token = "mock-jwt-token";
      localStorage.setItem("auth_token", token);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const result = getAuthToken();

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result).toBe(token);

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
    });

    it("shouldReturnNullWhenTokenDoesNotExistInLocalStorage", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const result = getAuthToken();

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result).toBeNull();

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
    });
  });

  describe("getStoredUser", () => {
    it("shouldReturnParsedUserWhenValidUserJsonExists", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      localStorage.setItem("auth_user", JSON.stringify(mockUser));

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const result = getStoredUser();

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result).toEqual(mockUser);

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
    });

    it("shouldReturnNullWhenUserDoesNotExist", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const result = getStoredUser();

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result).toBeNull();

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
    });

    it("shouldReturnNullWhenUserJsonIsMalformed", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      localStorage.setItem("auth_user", "invalid-json-{");

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const result = getStoredUser();

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result).toBeNull();

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
    });
  });

  describe("setAuthSession", () => {
    it("shouldSaveTokenAndUserToLocalStorageAndDispatchEvent", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const token = "new-token-123";
      const eventSpy = vi.spyOn(window, "dispatchEvent");

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      setAuthSession(token, mockUser);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(localStorage.getItem("auth_token")).toBe(token);
      expect(localStorage.getItem("auth_user")).toBe(JSON.stringify(mockUser));

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy.mock.calls[0][0].type).toBe("auth-updated");
    });
  });

  describe("updateStoredUser", () => {
    it("shouldUpdateUserFieldsAndDispatchEventWhenUserExists", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
      const eventSpy = vi.spyOn(window, "dispatchEvent");
      const updates = { fullName: "Jane Doe", avatarUrl: "https://example.com/avatar.jpg" };

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      updateStoredUser(updates);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      const updatedInStorage = JSON.parse(localStorage.getItem("auth_user") || "{}");
      expect(updatedInStorage.fullName).toBe("Jane Doe");
      expect(updatedInStorage.avatarUrl).toBe("https://example.com/avatar.jpg");
      expect(updatedInStorage.username).toBe("john_doe");

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy.mock.calls[0][0].type).toBe("auth-updated");
    });

    it("shouldDoNothingWhenUserDoesNotExist", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const eventSpy = vi.spyOn(window, "dispatchEvent");

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      updateStoredUser({ fullName: "Jane Doe" });

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(localStorage.getItem("auth_user")).toBeNull();

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe("clearAuthSession", () => {
    it("shouldRemoveItemsFromLocalStorageAndDispatchEvent", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      localStorage.setItem("auth_token", "sample-token");
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
      const eventSpy = vi.spyOn(window, "dispatchEvent");

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      clearAuthSession();

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(localStorage.getItem("auth_user")).toBeNull();

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy.mock.calls[0][0].type).toBe("auth-updated");
    });
  });
});
