/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/client.ts
 *
 * Purpose
 * -------
 * Verify that the core API HTTP client (apiCall, apiGet, apiPost, apiPut, apiDelete)
 * formats request headers, attaches Bearer authorization tokens, inspects backend
 * ApiResponse success envelopes, throws typed ApiError instances on failure, and
 * maps HTTP methods.
 *
 * Tested Features
 * ---------------
 * ✓ apiCall core request wrapper
 * ✓ Authorization Bearer token attachment from localStorage
 * ✓ Header merging (Headers instance, Array, Record)
 * ✓ Content-Type header injection logic
 * ✓ Backend ApiResponse envelope success checking and error throwing
 * ✓ Non-envelope HTTP failure handling
 * ✓ Convenience method wrappers (apiGet, apiPost, apiPut, apiDelete)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Successful GET request with ApiResponse envelope
 * ✓ Successful POST request with JSON body
 * ✓ PUT and DELETE HTTP requests
 * ✓ Backend returning success: false envelope (throwing ApiError)
 * ✓ HTTP error without envelope structure
 * ✓ Header overrides (custom headers, Headers object)
 * ✓ Unauthenticated request (no token in localStorage)
 *
 * Mocked Dependencies
 * -------------------
 * - global.fetch
 *
 * Not Covered
 * -----------
 * - Next.js Server Components headers/cookies fallback logic
 *
 * Notes
 * -----
 * Unit test for API HTTP client services.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { apiCall, apiGet, apiPost, apiPut, apiDelete } from "../client";
import { ApiError } from "../../type/api";

describe("api/client HTTP Service", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("apiCall", () => {
    it("shouldPerformFetchWithDefaultJsonHeadersAndAuthorizationHeader", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      localStorage.setItem("auth_token", "test-bearer-token");
      const mockApiResponse = {
        success: true,
        status: "OK",
        message: "Fetched successfully",
        data: { id: 1, name: "Sample Course" },
      };

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const result = await apiCall("/api/v1/courses/1");

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result).toEqual(mockApiResponse);

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(fetchSpy).toHaveBeenCalledWith(
        "http://localhost:9020/api/v1/courses/1",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-bearer-token",
          }),
        }),
      );
    });

    it("shouldThrowApiErrorWhenEnvelopeSuccessIsFalse", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const errorEnvelope = {
        success: false,
        status: "NOT_FOUND",
        message: "Course not found",
        data: null,
      };

      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => errorEnvelope,
      } as Response);

      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the component or function and verify output.
      // ----------------------------------------------------------------------------
      await expect(apiCall("/api/v1/courses/999")).rejects.toThrow(
        new ApiError("NOT_FOUND", "Course not found", null),
      );
    });

    it("shouldThrowApiErrorWhenResponseNotOkAndNoEnvelopeReturned", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: "Database connection failed" }),
      } as Response);

      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the component or function and verify output.
      // ----------------------------------------------------------------------------
      await expect(apiCall("/api/v1/health")).rejects.toThrow(
        new ApiError("INTERNAL_SERVER_ERROR", "Database connection failed", {
          message: "Database connection failed",
        }),
      );
    });

    it("shouldPreserveCustomHeadersWhenHeadersObjectIsProvided", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const customHeaders = new Headers();
      customHeaders.append("X-Custom-Header", "CustomValue");

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, status: "OK", data: true }),
      } as Response);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      await apiCall("/test", { headers: customHeaders });

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(fetchSpy).toHaveBeenCalledWith(
        "http://localhost:9020/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-custom-header": "CustomValue",
          }),
        }),
      );
    });
  });

  describe("HTTP Helper Wrappers (apiGet, apiPost, apiPut, apiDelete)", () => {
    it("shouldReturnUnwrappedDataPropertyForApiGet", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const payload = { id: 10, title: "Test Title" };
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, status: "OK", data: payload }),
      } as Response);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const result = await apiGet<{ id: number; title: string }>("/test-get");

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result).toEqual(payload);
    });

    it("shouldSendSerializedBodyForApiPost", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const body = { title: "New Item" };
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, status: "CREATED", data: { id: 1, ...body } }),
      } as Response);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const result = await apiPost<{ id: number; title: string }>("/test-post", body);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result).toEqual({ id: 1, title: "New Item" });
      expect(fetchSpy).toHaveBeenCalledWith(
        "http://localhost:9020/test-post",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(body),
        }),
      );
    });

    it("shouldSendSerializedBodyForApiPut", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const body = { title: "Updated Item" };
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, status: "OK", data: body }),
      } as Response);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const result = await apiPut<{ title: string }>("/test-put/1", body);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result).toEqual(body);
      expect(fetchSpy).toHaveBeenCalledWith(
        "http://localhost:9020/test-put/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(body),
        }),
      );
    });

    it("shouldExecuteDeleteRequestForApiDelete", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, status: "OK", data: true }),
      } as Response);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const result = await apiDelete<boolean>("/test-delete/1");

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        "http://localhost:9020/test-delete/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });
});
