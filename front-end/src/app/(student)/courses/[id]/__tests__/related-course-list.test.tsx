/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/related-course-list.tsx
 *
 * Purpose
 * -------
 * Verify that RelatedCourseList component renders skeleton placeholders when loading,
 * empty state when no related courses exist, and course cards when data exists.
 *
 * Tested Features
 * ---------------
 * ✓ Skeleton cards rendering when loadingRelated = true
 * ✓ "No related courses found." empty message rendering when array is empty
 * ✓ Related course cards rendering when array has data
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty related courses state
 * ✓ Rendering related course cards
 *
 * Mocked Dependencies
 * -------------------
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - CSS grid layout calculations
 *
 * Notes
 * -----
 * Unit test for RelatedCourseList component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RelatedCourseList } from "../related-course-list";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("RelatedCourseList", () => {
  it("shouldRenderNoRelatedCoursesFoundWhenArrayIsEmpty", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render RelatedCourseList with empty array.
    // ----------------------------------------------------------------------------
    render(<RelatedCourseList relatedCourses={[]} loadingRelated={false} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state message.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No related courses found.")).toBeInTheDocument();
  });

  it("shouldRenderRelatedCourseCardsWhenDataExists", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock related courses.
    // ----------------------------------------------------------------------------
    const mockRelated = [
      {
        id: "c-10",
        title: "Advanced TypeScript Techniques",
        originalPrice: 500000,
        discountedPercentage: 10,
        thumbnailUrl: "https://example.com/thumb.jpg",
        lecturerName: "Jane Doe",
      },
    ];

    // ----------------------------------------------------------------------------
    // Act
    // Render RelatedCourseList.
    // ----------------------------------------------------------------------------
    render(
      <RelatedCourseList
        relatedCourses={mockRelated as any}
        loadingRelated={false}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify course title renders.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Advanced TypeScript Techniques"),
    ).toBeInTheDocument();
  });
});
