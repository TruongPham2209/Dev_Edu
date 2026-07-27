/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/lectures/[lectureId]/assignments/[assignmentId]/assignment-detail-skeleton.tsx
 *
 * Purpose
 * -------
 * Verify that AssignmentDetailSkeleton component renders placeholder loading skeleton boxes.
 *
 * Tested Features
 * ---------------
 * ✓ Skeleton rendering without crashing
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state skeleton while assignment details are fetched
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
 * Unit test for AssignmentDetailSkeleton component.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssignmentDetailSkeleton } from "../assignment-detail-skeleton";

describe("AssignmentDetailSkeleton", () => {
  it("shouldRenderAssignmentDetailSkeletonWithoutCrashing", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AssignmentDetailSkeleton.
    // ----------------------------------------------------------------------------
    const { container } = render(<AssignmentDetailSkeleton />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify container element is rendered.
    // ----------------------------------------------------------------------------
    expect(container.firstChild).toBeInTheDocument();
  });
});
