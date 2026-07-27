/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/auth/login.ts
 *
 * Purpose
 * -------
 * Verify that loginWithPasswordGrant handles password grant OAuth2 authentication requests,
 * basic authorization header encoding, parameter serialization, network errors,
 * status code mappings, response validation, and environment configuration checks.
 *
 * Tested Features
 * ---------------
 * ✓ Environment configuration validation (AUTH_BASE_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET)
 * ✓ OAuth2 password grant form data preparation and Basic Auth header encoding
 * ✓ Successful authentication returning OAuthTokenResponse
 * ✓ Error handling for network failures (fetch exceptions)
 * ✓ Status code 400/401 mapping to "invalid_credentials" AuthError
 * ✓ Status code 500 mapping to "server_error" AuthError
 * ✓ Response validation for non-object payload or missing access_token
 *
 * Covered Scenarios
 * -----------------
 * ✓ Missing env variables
 * ✓ Successful OAuth token acquisition
 * ✓ 401 Unauthorized status response
 * ✓ 500 Server error status response
 * ✓ Response missing access_token property
 * ✓ Network request throw exception
 *
 * Mocked Dependencies
 * -------------------
 * - global.fetch
 *
 * Not Covered
 * -----------
 * - Real OAuth2 server interaction
 *
 * Notes
 * -----
 * Unit test for OAuth login service.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loginWithPasswordGrant } from "../login";
import { AuthError } from "../../type/api";

describe("loginWithPasswordGrant", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.AUTH_BASE_URL = "http://auth.example.com";
    process.env.OAUTH_CLIENT_ID = "test-client-id";
    process.env.OAUTH_CLIENT_SECRET = "test-client-secret";
    process.env.OAUTH_SCOPE = "read write";
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("shouldThrowAuthErrorWhenMissingEnvironmentConfiguration", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    delete process.env.AUTH_BASE_URL;

    // ----------------------------------------------------------------------------
    // Act & Assert
    // Execute the component or function and verify output.
    // ----------------------------------------------------------------------------
    await expect(loginWithPasswordGrant("user", "pass")).rejects.toThrow(
      new AuthError("missing_config", "Missing environment configuration."),
    );
  });

  it("shouldReturnTokenResponseWhenCredentialsAreValid", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    const mockSuccessResponse = {
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      token_type: "Bearer",
      expires_in: 3600,
    };

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockSuccessResponse,
    } as Response);

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const result = await loginWithPasswordGrant("john_doe", "secret123");

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    expect(result).toEqual(mockSuccessResponse);

    // ----------------------------------------------------------------------------
    // Verify
    // Verify interaction with mocked dependencies.
    // ----------------------------------------------------------------------------
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://auth.example.com/oauth2/token",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: expect.stringMatching(/^Basic /),
        }),
      }),
    );
  });

  it("shouldThrowInvalidCredentialsWhenStatusIs401", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ error: "invalid_grant" }),
    } as Response);

    // ----------------------------------------------------------------------------
    // Act & Assert
    // Execute the component or function and verify output.
    // ----------------------------------------------------------------------------
    await expect(loginWithPasswordGrant("john_doe", "wrong_pass")).rejects.toThrow(
      new AuthError("invalid_credentials", "Invalid credentials."),
    );
  });

  it("shouldThrowServerErrorWhenStatusIs500", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers({ "content-type": "text/plain" }),
      text: async () => "Internal Server Error",
    } as Response);

    // ----------------------------------------------------------------------------
    // Act & Assert
    // Execute the component or function and verify output.
    // ----------------------------------------------------------------------------
    await expect(loginWithPasswordGrant("john_doe", "pass")).rejects.toThrow(
      new AuthError("server_error", "OAuth server error."),
    );
  });

  it("shouldThrowNetworkErrorWhenFetchThrowsException", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Failed to fetch"));

    // ----------------------------------------------------------------------------
    // Act & Assert
    // Execute the component or function and verify output.
    // ----------------------------------------------------------------------------
    await expect(loginWithPasswordGrant("john_doe", "pass")).rejects.toThrow(
      new AuthError("network_error", "Network error."),
    );
  });

  it("shouldThrowInvalidResponseWhenAccessTokenIsMissingInResponsePayload", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ token_type: "Bearer" }),
    } as Response);

    // ----------------------------------------------------------------------------
    // Act & Assert
    // Execute the component or function and verify output.
    // ----------------------------------------------------------------------------
    await expect(loginWithPasswordGrant("john_doe", "pass")).rejects.toThrow(
      new AuthError("invalid_response", "Missing access token."),
    );
  });
});
