/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/course-detail-skeleton.tsx
 *
 * Purpose
 * -------
 * Verify that StudentCourseDetailSkeleton component renders placeholder skeleton boxes
 * for course loading state.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering StudentCourseDetailSkeleton without throwing errors
 *
 * Covered Scenarios
 * -----------------
 * ✓ Skeleton placeholder layout rendering
 *
 * Mocked Dependencies
 * -------------------
 * - None
 *
 * Not Covered
 * -----------
 * - CSS animation pulse keyframes
 *
 * Notes
 * -----
 * Unit test for StudentCourseDetailSkeleton component.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudentCourseDetailSkeleton } from "../course-detail-skeleton";

describe("StudentCourseDetailSkeleton", () => {
  it("shouldRenderCourseDetailSkeletonWithoutCrashing", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render StudentCourseDetailSkeleton.
    // ----------------------------------------------------------------------------
    const { container } = render(<StudentCourseDetailSkeleton />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify container element renders skeleton blocks.
    // ----------------------------------------------------------------------------
    expect(container.firstChild).toBeInTheDocument();
  });
});
