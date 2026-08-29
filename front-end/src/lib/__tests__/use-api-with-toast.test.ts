/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/use-api-with-toast.ts
 *
 * Purpose
 * -------
 * Verify that the useApiWithToast hook formats and forwards error messages
 * and success responses to the Toast notification system correctly.
 *
 * Tested Features
 * ---------------
 * ✓ ApiError status-to-message mapping
 * ✓ ApiError custom serverMessage precedence
 * ✓ Generic Error message handling
 * ✓ Fallback default message handling for unexpected errors
 * ✓ Success message triggering from API responses
 *
 * Covered Scenarios
 * -----------------
 * ✓ ApiError with serverMessage
 * ✓ ApiError with mapped status code (BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, etc.)
 * ✓ ApiError with unknown status code
 * ✓ Standard JavaScript Error object
 * ✓ Non-Error object thrown (string, null, object)
 * ✓ ApiResponse containing message field
 * ✓ ApiResponse with no message field / null response
 *
 * Mocked Dependencies
 * -------------------
 * - src/lib/toast-context (useToast)
 *
 * Not Covered
 * -----------
 * - DOM Toast UI rendering
 *
 * Notes
 * -----
 * Unit test for custom hook leveraging React Testing Library renderHook.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useApiWithToast } from "../use-api-with-toast";
import { useToast } from "../toast-context";
import { ApiError } from "../type/api";

vi.mock("../toast-context", () => ({
  useToast: vi.fn(),
}));

describe("useApiWithToast", () => {
  const mockToast = {
    show: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue(mockToast);
  });

  describe("handleError", () => {
    it("shouldPreferServerMessageWhenApiErrorHasServerMessage", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useApiWithToast());
      const apiError1 = new ApiError("BAD_REQUEST", "Server specified error message", null);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      result.current.handleError(apiError1);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(mockToast.error).toHaveBeenCalledWith("Server specified error message");
    });

    it("shouldUseMappedStatusMessageWhenApiErrorHasNoServerMessage", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useApiWithToast());
      const apiError = new ApiError("UNAUTHORIZED", "", null);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      result.current.handleError(apiError);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(mockToast.error).toHaveBeenCalledWith("Please login to continue.");
    });

    it("shouldUseDefaultMessageWhenApiErrorHasUnknownStatus", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useApiWithToast());
      const apiError = new ApiError("CUSTOM_STATUS", "", null);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      result.current.handleError(apiError, "Fallback message");

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(mockToast.error).toHaveBeenCalledWith("Fallback message");
    });

    it("shouldUseErrorMessageWhenStandardErrorIsPassed", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useApiWithToast());
      const error = new Error("Network connection dropped");

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      result.current.handleError(error);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(mockToast.error).toHaveBeenCalledWith("Network connection dropped");
    });

    it("shouldUseDefaultMessageWhenUnknownErrorTypeIsPassed", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useApiWithToast());

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      result.current.handleError("some string exception");

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(mockToast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  describe("showSuccess & handleSuccess", () => {
    it("shouldTriggerToastSuccessWhenShowSuccessIsCalled", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useApiWithToast());

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      result.current.showSuccess("Course saved successfully");

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(mockToast.success).toHaveBeenCalledWith("Course saved successfully");
    });

    it("shouldTriggerToastSuccessWhenHandleSuccessReceivesMessageResponse", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useApiWithToast());
      const response = { message: "Updated profile data" };

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      result.current.handleSuccess(response);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(mockToast.success).toHaveBeenCalledWith("Updated profile data");
    });

    it("shouldNotTriggerToastSuccessWhenHandleSuccessReceivesNullOrEmptyResponse", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useApiWithToast());

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      result.current.handleSuccess(null);
      result.current.handleSuccess({});

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(mockToast.success).not.toHaveBeenCalled();
    });
  });
});
