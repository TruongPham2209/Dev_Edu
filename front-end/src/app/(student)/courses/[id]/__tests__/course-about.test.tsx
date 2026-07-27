/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/course-about.tsx
 *
 * Purpose
 * -------
 * Verify that CourseAbout component renders title "About this course" and dangeronsly renders
 * course description HTML content.
 *
 * Tested Features
 * ---------------
 * ✓ Heading rendering
 * ✓ HTML description rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering course description content
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS typography styling
 *
 * Notes
 * -----
 * Unit test for CourseAbout component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CourseAbout } from "../course-about";

describe("CourseAbout", () => {
  it("shouldRenderTitleAndHTMLDescription", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CourseAbout.
    // ----------------------------------------------------------------------------
    render(
      <CourseAbout description="<p>Learn <strong>React 19</strong> from scratch.</p>" />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and rendered HTML.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("About this course")).toBeInTheDocument();
    expect(screen.getByText(/Learn/i)).toBeInTheDocument();
    expect(screen.getByText("React 19")).toBeInTheDocument();
  });
});
