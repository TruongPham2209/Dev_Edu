/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/forum/forum-hero.tsx
 *
 * Purpose
 * -------
 * Verify that ForumHero component renders community tag line, main heading, and stats counters.
 *
 * Tested Features
 * ---------------
 * ✓ DevEdu Community badge rendering
 * ✓ Main headline banner rendering
 * ✓ Stats counters (25k+ Members, 10k+ Posts) display
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering ForumHero component
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS gradient backgrounds
 *
 * Notes
 * -----
 * Unit test for ForumHero component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForumHero } from "../forum-hero";

describe("ForumHero", () => {
  it("shouldRenderCommunityBadgeHeadlineAndStatsCounters", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ForumHero.
    // ----------------------------------------------------------------------------
    render(<ForumHero />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify badge, headline, and stats counters render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("DevEdu Community")).toBeInTheDocument();
    expect(screen.getByText(/A place to connect/i)).toBeInTheDocument();
    expect(screen.getByText("25k+")).toBeInTheDocument();
    expect(screen.getByText("10k+")).toBeInTheDocument();
  });
});
