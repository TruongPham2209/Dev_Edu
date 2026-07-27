/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/courses/[id]/lectures/[lectureId]/lecture-detail-skeleton.tsx
 *
 * Purpose
 * -------
 * Verify that LectureDetailSkeleton component renders placeholder skeletons.
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
 * Unit test for LectureDetailSkeleton component.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LectureDetailSkeleton } from "../lecture-detail-skeleton";

describe("LectureDetailSkeleton", () => {
  it("shouldRenderLectureDetailSkeletonWithoutCrashing", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render LectureDetailSkeleton.
    // ----------------------------------------------------------------------------
    const { container } = render(<LectureDetailSkeleton />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify container renders skeleton layout.
    // ----------------------------------------------------------------------------
    expect(container.firstChild).toBeInTheDocument();
  });
});
