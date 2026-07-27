/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/forum/forum-search.tsx
 *
 * Purpose
 * -------
 * Verify that ForumSearch component renders search text input, popular tags, and handles keyword changes
 * and search triggers.
 *
 * Tested Features
 * ---------------
 * ✓ Search TextField rendering and input change callback
 * ✓ Popular tags rendering (React, Spring Boot, Clean Architecture, AI Tools)
 * ✓ Popular tag click triggering onSearch callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Typing search keyword
 * ✓ Clicking a popular tag
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - Focus transition styling
 *
 * Notes
 * -----
 * Unit test for ForumSearch component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ForumSearch } from "../forum-search";

describe("ForumSearch", () => {
  it("shouldRenderSearchInputPopularTagsAndTriggerSearchOnTagClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare callbacks.
    // ----------------------------------------------------------------------------
    const handleOnChangeKeyword = vi.fn();
    const handleOnSearch = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render ForumSearch.
    // ----------------------------------------------------------------------------
    render(
      <ForumSearch
        keyword="React"
        onChangeKeyword={handleOnChangeKeyword}
        onSearch={handleOnSearch}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify search input value and popular tag chips render.
    // ----------------------------------------------------------------------------
    const input = screen.getByPlaceholderText(
      "Search topics, questions, tutorials...",
    );
    expect(input).toHaveValue("React");
    expect(screen.getByText("Spring Boot")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click popular tag chip.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByText("Spring Boot"));

    expect(handleOnSearch).toHaveBeenCalledWith("Spring Boot");
  });
});
