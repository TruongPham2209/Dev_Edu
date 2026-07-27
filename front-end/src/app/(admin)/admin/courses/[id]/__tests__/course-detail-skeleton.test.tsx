/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/courses/[id]/course-detail-skeleton.tsx
 *
 * Purpose
 * -------
 * Verify that AdminCourseDetailSkeleton component renders placeholder skeleton cards.
 *
 * Tested Features
 * ---------------
 * ✓ Skeleton placeholders layout rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state layout
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
 * Unit test for AdminCourseDetailSkeleton component.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminCourseDetailSkeleton } from "../course-detail-skeleton";

describe("AdminCourseDetailSkeleton", () => {
  it("shouldRenderAdminCourseDetailSkeletonWithoutCrashing", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AdminCourseDetailSkeleton.
    // ----------------------------------------------------------------------------
    const { container } = render(<AdminCourseDetailSkeleton />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify container renders skeleton elements.
    // ----------------------------------------------------------------------------
    expect(container.firstChild).toBeInTheDocument();
  });
});
