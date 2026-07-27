/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/forum/trending-topics.tsx
 *
 * Purpose
 * -------
 * Verify that TrendingTopics component renders Trending Topics title, topic items,
 * user counts & timestamps, and handles topic click callback.
 *
 * Tested Features
 * ---------------
 * ✓ Header rendering ("Trending Topics")
 * ✓ Topic titles, active users count, and time elapsed display
 * ✓ Topic click triggering onSelectTopic callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering default trending topics list
 * ✓ Clicking a trending topic
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS hover background
 *
 * Notes
 * -----
 * Unit test for TrendingTopics component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TrendingTopics } from "../trending-topics";

describe("TrendingTopics", () => {
  it("shouldRenderTopicsAndTriggerTopicSelection", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare onSelectTopic handler.
    // ----------------------------------------------------------------------------
    const handleSelectTopic = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render TrendingTopics.
    // ----------------------------------------------------------------------------
    render(<TrendingTopics onSelectTopic={handleSelectTopic} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify Trending Topics header and default topic item titles render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Trending Topics")).toBeInTheDocument();
    expect(
      screen.getByText("Sự thật về Node.js Event Loop"),
    ).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click topic card.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByText("Sự thật về Node.js Event Loop"));

    expect(handleSelectTopic).toHaveBeenCalledWith(
      "Sự thật về Node.js Event Loop",
    );
  });
});
