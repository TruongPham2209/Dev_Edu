/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/util/status-utils.ts
 *
 * Purpose
 * -------
 * Verify that status utility functions accurately map forum post status codes
 * to corresponding MUI color severity identifiers.
 *
 * Tested Features
 * ---------------
 * ✓ getStatusColor post status color mapping
 *
 * Covered Scenarios
 * -----------------
 * ✓ APPROVED -> "success"
 * ✓ PENDING -> "warning"
 * ✓ REJECTED -> "error"
 * ✓ SUPERSEDED -> "default"
 * ✓ Unknown / invalid status -> "default"
 *
 * Mocked Dependencies
 * -------------------
 * - None (pure utility unit tests)
 *
 * Not Covered
 * -----------
 * - CSS chip styling rules
 *
 * Notes
 * -----
 * Pure unit test for status color mapper.
 */

import { describe, it, expect } from "vitest";
import { getStatusColor } from "../status-utils";

describe("status-utils", () => {
  describe("getStatusColor", () => {
    it("shouldReturnSuccessForApprovedStatus", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(getStatusColor("APPROVED")).toBe("success");
    });

    it("shouldReturnWarningForPendingStatus", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(getStatusColor("PENDING")).toBe("warning");
    });

    it("shouldReturnErrorForRejectedStatus", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(getStatusColor("REJECTED")).toBe("error");
    });

    it("shouldReturnDefaultForSupersededStatus", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(getStatusColor("SUPERSEDED")).toBe("default");
    });

    it("shouldReturnDefaultForUnknownStatus", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(getStatusColor("UNKNOWN")).toBe("default");
      expect(getStatusColor("")).toBe("default");
    });
  });
});
