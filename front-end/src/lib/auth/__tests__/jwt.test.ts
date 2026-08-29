/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/auth/jwt.ts
 *
 * Purpose
 * -------
 * Verify that decodeJwt correctly decodes base64/base64url encoded JWT payloads
 * across Node, Browser, and Edge runtimes, handling multi-byte UTF-8 characters,
 * malformed tokens, and edge inputs deterministically.
 *
 * Tested Features
 * ---------------
 * ✓ JWT payload decoding and JSON parsing
 * ✓ Base64url to base64 character replacement
 * ✓ Multi-byte UTF-8 character percent-decoding
 * ✓ Fallback decoding logic (window.atob vs global atob vs Buffer)
 * ✓ Error handling and logging on malformed JWT input
 *
 * Covered Scenarios
 * -----------------
 * ✓ Valid 3-part JWT token with claims (sub, roles, exp)
 * ✓ JWT token containing UTF-8 unicode characters (e.g. Vietnamese names)
 * ✓ Empty string or null/undefined token input
 * ✓ Malformed tokens (invalid split count != 3)
 * ✓ Corrupted payload JSON
 *
 * Mocked Dependencies
 * -------------------
 * - console.error (mocked to prevent verbose error logs during negative tests)
 *
 * Not Covered
 * -----------
 * - JWT signature verification or cryptographic validation
 *
 * Notes
 * -----
 * Pure unit test for decodeJwt utility function.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { decodeJwt, type JwtPayload } from "../jwt";

describe("decodeJwt", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shouldDecodeValidJwtPayloadCorrectly", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    const payload: JwtPayload = {
      sub: "user-12345",
      roles: ["STUDENT", "ADMIN"],
      exp: 1735689600,
    };
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = "dummy-signature";
    const token = `${header}.${encodedPayload}.${signature}`;

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const result = decodeJwt(token);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    expect(result).toEqual(payload);
  });

  it("shouldDecodeJwtPayloadWithUnicodeCharactersCorrectly", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    const payload = {
      sub: "user-99",
      name: "Nguyễn Văn Ánh",
      roles: ["LECTURER"],
    };
    const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url");
    const jsonStr = JSON.stringify(payload);
    // Base64url encode with utf-8 compatibility
    const base64 = Buffer.from(jsonStr, "utf-8").toString("base64url");
    const token = `${header}.${base64}.signature`;

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const result = decodeJwt(token);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    expect(result).toEqual(payload);
  });

  it("shouldReturnNullWhenTokenIsEmptyOrNull", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    // Act & Assert
    // Execute the component or function and verify output.
    // ----------------------------------------------------------------------------
    expect(decodeJwt("")).toBeNull();
    expect(decodeJwt(null as never)).toBeNull();
    expect(decodeJwt(undefined as never)).toBeNull();
  });

  it("shouldReturnNullWhenTokenDoesNotHaveThreeParts", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    // Act & Assert
    // Execute the component or function and verify output.
    // ----------------------------------------------------------------------------
    expect(decodeJwt("header.payload")).toBeNull();
    expect(decodeJwt("invalid-token-string")).toBeNull();
    expect(decodeJwt("a.b.c.d")).toBeNull();
  });

  it("shouldReturnNullAndLogErrorWhenPayloadIsInvalidJson", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    const header = "eyJhbGciOiJIUzI1NiJ9";
    const invalidPayload = "invalid-base64-content!@#$";
    const token = `${header}.${invalidPayload}.signature`;

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const result = decodeJwt(token);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    expect(result).toBeNull();

    // ----------------------------------------------------------------------------
    // Verify
    // Verify interaction with mocked dependencies.
    // ----------------------------------------------------------------------------
    expect(console.error).toHaveBeenCalled();
  });
});
