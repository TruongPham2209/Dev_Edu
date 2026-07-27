/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/lectures/[lectureId]/lecture-detail-skeleton.tsx
 *
 * Purpose
 * -------
 * Verify that LectureDetailSkeleton component renders placeholder loading skeleton elements.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering skeleton element without crashing
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state skeleton while lecture details are fetched
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
    // Verify container renders.
    // ----------------------------------------------------------------------------
    expect(container.firstChild).toBeInTheDocument();
  });
});
