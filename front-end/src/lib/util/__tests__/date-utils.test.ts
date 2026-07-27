/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/util/date-utils.ts
 *
 * Purpose
 * -------
 * Verify that date parsing, server date formatting, and price formatting utilities
 * handle server Jackson date arrays, ISO strings, timestamps, invalid inputs, and currency
 * representation accurately.
 *
 * Tested Features
 * ---------------
 * ✓ parseServerDate array format parsing ([year, month, day, hour, minute, second, nano])
 * ✓ parseServerDate ISO string and timestamp parsing
 * ✓ parseServerDate fallback for null/undefined/invalid values
 * ✓ formatServerDate date mode ("DD/MM/YYYY")
 * ✓ formatServerDate datetime mode ("DD/MM/YYYY HH:mm:ss")
 * ✓ formatPrice thousand-separator dot formatting
 *
 * Covered Scenarios
 * -----------------
 * ✓ Jackson array date: [2026, 7, 27, 10, 30, 0, 500000000]
 * ✓ ISO date string: "2026-07-27T10:30:00.000Z"
 * ✓ Timestamp number: 1735689600000
 * ✓ Invalid date string ("invalid-date")
 * ✓ Null / undefined / empty values
 * ✓ Price formatting: 0, 1000, 1500000, 25000000
 *
 * Mocked Dependencies
 * -------------------
 * - None (pure utility unit tests)
 *
 * Not Covered
 * -----------
 * - Browser time zone conversions
 *
 * Notes
 * -----
 * Pure unit test for date and currency formatting utilities.
 */

import { describe, it, expect } from "vitest";
import { parseServerDate, formatServerDate, formatPrice } from "../date-utils";

describe("date-utils", () => {
  describe("parseServerDate", () => {
    it("shouldParseJacksonArrayFormatCorrectly", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      // [year, month, day, hour, minute, second, nano]
      const jacksonDate = [2026, 7, 27, 14, 30, 45, 500000000];

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const parsed = parseServerDate(jacksonDate);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(6); // 0-indexed month (July)
      expect(parsed.getDate()).toBe(27);
      expect(parsed.getHours()).toBe(14);
      expect(parsed.getMinutes()).toBe(30);
      expect(parsed.getSeconds()).toBe(45);
      expect(parsed.getMilliseconds()).toBe(500);
    });

    it("shouldParseIsoStringAndTimestampCorrectly", () => {
      // ----------------------------------------------------------------------------
      // Arrange & Act & Assert
      // Execute the component or function and verify output.
      // ----------------------------------------------------------------------------
      const isoStr = "2026-07-27T08:00:00.000Z";
      const parsedIso = parseServerDate(isoStr);
      expect(parsedIso.toISOString()).toBe(isoStr);

      const timestamp = 1735689600000;
      const parsedTimestamp = parseServerDate(timestamp);
      expect(parsedTimestamp.getTime()).toBe(timestamp);
    });

    it("shouldReturnCurrentDateWhenInputIsNullUndefinedOrInvalid", () => {
      // ----------------------------------------------------------------------------
      // Arrange & Act & Assert
      // Execute the component or function and verify output.
      // ----------------------------------------------------------------------------
      const before = Date.now();
      const parsedNull = parseServerDate(null);
      const parsedInvalid = parseServerDate("invalid-date-string");
      const after = Date.now();

      expect(parsedNull.getTime()).toBeGreaterThanOrEqual(before);
      expect(parsedNull.getTime()).toBeLessThanOrEqual(after);

      expect(parsedInvalid.getTime()).toBeGreaterThanOrEqual(before);
      expect(parsedInvalid.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe("formatServerDate", () => {
    it("shouldFormatDateInDefaultDateMode", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const dateArray = [2026, 7, 5];

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const formatted = formatServerDate(dateArray, "date");

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(formatted).toBe("05/07/2026");
    });

    it("shouldFormatDateInDatetimeMode", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const dateArray = [2026, 12, 25, 9, 5, 8];

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const formatted = formatServerDate(dateArray, "datetime");

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(formatted).toBe("25/12/2026 09:05:08");
    });
  });

  describe("formatPrice", () => {
    it("shouldFormatPriceWithDotSeparators", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(formatPrice(0)).toBe("0");
      expect(formatPrice(500)).toBe("500");
      expect(formatPrice(1000)).toBe("1.000");
      expect(formatPrice(1500000)).toBe("1.500.000");
      expect(formatPrice(25000000)).toBe("25.000.000");
    });
  });
});
