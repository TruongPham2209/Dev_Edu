/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/forum/community-guidelines.tsx
 *
 * Purpose
 * -------
 * Verify that CommunityGuidelines component renders title, guideline description,
 * and Read Guidelines action button.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering
 * ✓ Guideline body text display
 * ✓ Read Guidelines button display
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering Community Guidelines card
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS border style
 *
 * Notes
 * -----
 * Unit test for CommunityGuidelines component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommunityGuidelines } from "../community-guidelines";

describe("CommunityGuidelines", () => {
  it("shouldRenderTitleDescriptionAndReadButton", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CommunityGuidelines.
    // ----------------------------------------------------------------------------
    render(<CommunityGuidelines />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify header, text, and button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Community Guidelines")).toBeInTheDocument();
    expect(
      screen.getByText(/Professional programming discussion environment/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Read Guidelines" }),
    ).toBeInTheDocument();
  });
});
