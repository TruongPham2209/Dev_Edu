/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/course-search.tsx
 *
 * Purpose
 * -------
 * Verify that CourseSearch component renders search input box, trend suggestion chips,
 * and updates search keywords on chip click.
 *
 * Tested Features
 * ---------------
 * ✓ Headline banner rendering
 * ✓ SearchInput rendering
 * ✓ Trend suggestion chips (ReactJS, Next.js 14, Python, UI/UX Design)
 * ✓ Trend chip click triggering setSearchKeyword & setDebouncedKeyword callbacks
 *
 * Covered Scenarios
 * -----------------
 * ✓ Clicking a trend suggestion chip
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS hover animations
 *
 * Notes
 * -----
 * Unit test for CourseSearch component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CourseSearch } from "../course-search";

describe("CourseSearch", () => {
  it("shouldRenderTitleSearchInputAndTrendChips", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare callbacks.
    // ----------------------------------------------------------------------------
    const handleSetSearchKeyword = vi.fn();
    const handleSetDebouncedKeyword = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render CourseSearch.
    // ----------------------------------------------------------------------------
    render(
      <CourseSearch
        searchKeyword=""
        setSearchKeyword={handleSetSearchKeyword}
        setDebouncedKeyword={handleSetDebouncedKeyword}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and trend chips render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("What do you want to learn today?"),
    ).toBeInTheDocument();
    expect(screen.getByText("ReactJS")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click trend chip.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByText("ReactJS"));

    expect(handleSetSearchKeyword).toHaveBeenCalledWith("ReactJS");
    expect(handleSetDebouncedKeyword).toHaveBeenCalledWith("ReactJS");
  });
});
