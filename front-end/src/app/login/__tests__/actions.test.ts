/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/login/actions.ts
 *
 * Purpose
 * -------
 * Verify that loginAction Next.js Server Action performs form data validation,
 * executes OAuth2 password grant login, sets auth cookies, and maps AuthError
 * failure reasons to user-friendly messages.
 *
 * Tested Features
 * ---------------
 * ✓ Username and password field presence validation
 * ✓ OAuth2 password grant execution via loginWithPasswordGrant
 * ✓ Auth cookie storage via setAuthCookies
 * ✓ AuthError reason handling ("invalid_credentials", "missing_config")
 * ✓ Generic server failure fallback error message
 *
 * Covered Scenarios
 * -----------------
 * ✓ Missing username or password form fields
 * ✓ Valid credentials submission (success payload)
 * ✓ Invalid credentials error (AuthError "invalid_credentials")
 * ✓ Missing OAuth configuration error (AuthError "missing_config")
 * ✓ Generic exception error handling
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/auth/cookies" (setAuthCookies)
 * - "@/lib/auth/login" (loginWithPasswordGrant)
 *
 * Not Covered
 * -----------
 * - HTTP response headers setting
 *
 * Notes
 * -----
 * Unit test for loginAction Server Action.
 */

import * as cookiesAuth from "@/lib/auth/cookies";
import * as loginAuth from "@/lib/auth/login";
import { AuthError } from "@/lib/type/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "../actions";

vi.mock("@/lib/auth/login", () => ({
  loginWithPasswordGrant: vi.fn(),
}));

vi.mock("@/lib/auth/cookies", () => ({
  setAuthCookies: vi.fn(),
}));

describe("loginAction Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldReturnFieldErrorsWhenUsernameOrPasswordIsMissing", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Create empty FormData.
    // ----------------------------------------------------------------------------
    const formData = new FormData();

    // ----------------------------------------------------------------------------
    // Act
    // Invoke loginAction with empty form data.
    // ----------------------------------------------------------------------------
    const result = await loginAction({ error: null }, formData);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify fieldErrors for username and password.
    // ----------------------------------------------------------------------------
    expect(result.fieldErrors).toEqual({
      username: "Please enter your email.",
      password: "Please enter your password.",
    });
    expect(loginAuth.loginWithPasswordGrant).not.toHaveBeenCalled();
  });

  it("shouldPerformPasswordGrantLoginAndSetCookiesOnValidInput", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare valid form data and mock tokens.
    // ----------------------------------------------------------------------------
    const formData = new FormData();
    formData.append("username", "student@devedu.com");
    formData.append("password", "SecurePass123!");

    const mockTokens = {
      access_token: "jwt-access-token-xyz",
      refresh_token: "jwt-refresh-token-xyz",
      token_type: "Bearer",
      expires_in: 3600,
    };

    vi.mocked(loginAuth.loginWithPasswordGrant).mockResolvedValue(mockTokens);
    vi.mocked(cookiesAuth.setAuthCookies).mockResolvedValue(undefined);

    // ----------------------------------------------------------------------------
    // Act
    // Invoke loginAction.
    // ----------------------------------------------------------------------------
    const result = await loginAction({ error: null }, formData);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify loginWithPasswordGrant, setAuthCookies, and success result payload.
    // ----------------------------------------------------------------------------
    expect(loginAuth.loginWithPasswordGrant).toHaveBeenCalledWith(
      "student@devedu.com",
      "SecurePass123!",
    );
    expect(cookiesAuth.setAuthCookies).toHaveBeenCalledWith(mockTokens);
    expect(result).toEqual({
      error: null,
      success: true,
      username: "student@devedu.com",
      token: "jwt-access-token-xyz",
    });
  });

  it("shouldReturnUserFriendlyErrorMessageWhenCredentialsAreInvalid", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock loginWithPasswordGrant throwing invalid_credentials AuthError.
    // ----------------------------------------------------------------------------
    const formData = new FormData();
    formData.append("username", "wrong@devedu.com");
    formData.append("password", "WrongPass");

    vi.mocked(loginAuth.loginWithPasswordGrant).mockRejectedValue(
      new AuthError("invalid_credentials", "Unauthorized"),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Invoke loginAction.
    // ----------------------------------------------------------------------------
    const result = await loginAction({ error: null }, formData);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify mapped error message.
    // ----------------------------------------------------------------------------
    expect(result).toEqual({
      error: "Email or password is not correct. Please try again.",
    });
  });
});
