/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/course-detail-skeleton.tsx
 *
 * Purpose
 * -------
 * Verify that LecturerCourseDetailSkeleton component renders placeholder skeleton boxes
 * for hero, animated tabs, and content sections.
 *
 * Tested Features
 * ---------------
 * ✓ Skeleton rendering without crashing
 *
 * Covered Scenarios
 * -----------------
 * ✓ Displaying loading skeleton state while course details are fetched
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
 * Unit test for LecturerCourseDetailSkeleton component.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LecturerCourseDetailSkeleton } from "../course-detail-skeleton";

describe("LecturerCourseDetailSkeleton", () => {
  it("shouldRenderSkeletonPlaceholdersWithoutCrashing", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render LecturerCourseDetailSkeleton.
    // ----------------------------------------------------------------------------
    const { container } = render(<LecturerCourseDetailSkeleton />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify component container renders.
    // ----------------------------------------------------------------------------
    expect(container.firstChild).toBeInTheDocument();
  });
});
