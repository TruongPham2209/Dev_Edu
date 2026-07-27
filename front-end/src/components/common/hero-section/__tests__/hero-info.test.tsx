/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/hero-section/hero-info.tsx
 *
 * Purpose
 * -------
 * Verify that HeroInfo component renders hero title, description, icon, and tags chips.
 *
 * Tested Features
 * ---------------
 * ✓ Title and description text display
 * ✓ Management Panel badge display
 * ✓ Tags list chips display
 *
 * Covered Scenarios
 * -----------------
 * ✓ HeroInfo rendering with title, description, icon, and tags
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - Background glow radial gradient
 *
 * Notes
 * -----
 * Unit test for HeroInfo component.
 */

import { render, screen } from "@testing-library/react";
import { BookOpen } from "lucide-react";
import { describe, expect, it } from "vitest";
import { HeroInfo } from "../hero-info";

describe("HeroInfo", () => {
  it("shouldRenderTitleDescriptionAndTags", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render HeroInfo component.
    // ----------------------------------------------------------------------------
    render(
      <HeroInfo
        title="Course Management"
        description="Manage course curriculum, lectures, and assignments."
        icon={<BookOpen size={24} />}
        tags={["Spring Boot", "Next.js 16"]}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, description, badge, and tags exist in DOM.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Course Management")).toBeInTheDocument();
    expect(
      screen.getByText("Manage course curriculum, lectures, and assignments."),
    ).toBeInTheDocument();
    expect(screen.getByText("Management Panel")).toBeInTheDocument();
    expect(screen.getByText("Spring Boot")).toBeInTheDocument();
    expect(screen.getByText("Next.js 16")).toBeInTheDocument();
  });
});
