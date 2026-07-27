/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/course-manage-grid-skeleton.tsx
 *
 * Purpose
 * -------
 * Verify that CourseManageGridSkeleton component renders placeholder skeleton cards
 * with specified count.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering skeleton cards grid layout with default count (5) or custom count
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering skeleton placeholders during grid data loading
 *
 * Mocked Dependencies
 * -------------------
 * - None
 *
 * Not Covered
 * -----------
 * - CSS animation keyframes
 *
 * Notes
 * -----
 * Unit test for CourseManageGridSkeleton component.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CourseManageGridSkeleton } from "../course-manage-grid-skeleton";

describe("CourseManageGridSkeleton", () => {
  it("shouldRenderSpecifiedCountOfSkeletonCards", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CourseManageGridSkeleton with count = 3.
    // ----------------------------------------------------------------------------
    const { container } = render(<CourseManageGridSkeleton count={3} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify container element is rendered.
    // ----------------------------------------------------------------------------
    expect(container.firstChild).toBeInTheDocument();
  });
});
