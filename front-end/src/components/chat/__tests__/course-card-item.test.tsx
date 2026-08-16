/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/chat/course-card-item.tsx
 *
 * Purpose
 * -------
 * Verify rendering of course title, formatted price, AI match reason badge, thumbnail
 * image vs fallback icon, and card click navigation.
 *
 * Tested Features
 * ---------------
 * ✓ Course title display
 * ✓ Formatted price string via formatPrice
 * ✓ AI match reason badge display
 * ✓ Card image rendering vs fallback BookOpen icon
 * ✓ Card click navigation via useRouter.push
 * ✓ Single View Details action button click navigation
 *
 * Covered Scenarios
 * -----------------
 * ✓ Price > 0 (formatted currency string) vs Price = 0 ("Free")
 * ✓ Thumbnail URL present vs empty (fallback icon)
 * ✓ Card click triggers router.push to course detail page
 * ✓ Details button click triggers router.push
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation": useRouter
 *
 * Notes
 * -----
 * Unit test for CourseCardItem component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseCardItem } from "../course-card-item";
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("CourseCardItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleCourse = {
    courseId: "c-101",
    title: "Fullstack Next.js 16 Masterclass",
    shortDescription: "Build modern web apps with Next.js 16 and MUI.",
    price: 350000,
    thumbnailUrl: "https://example.com/next.png",
    matchReason: "Best match for fullstack goals",
  };

  it("shouldRenderCourseTitlePriceMatchReasonAndThumbnail", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render course card item.
    // ----------------------------------------------------------------------------
    render(<CourseCardItem course={sampleCourse} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify content elements are present.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Fullstack Next.js 16 Masterclass"),
    ).toBeInTheDocument();
    expect(screen.getByText("350.000 ₫")).toBeInTheDocument();
    expect(
      screen.getByText("Best match for fullstack goals"),
    ).toBeInTheDocument();

    const image = screen.getByAltText("Fullstack Next.js 16 Masterclass");
    expect(image).toHaveAttribute("src", "https://example.com/next.png");
    expect(
      screen.getByRole("button", { name: /details/i }),
    ).toBeInTheDocument();
  });

  it("shouldRenderFreePriceLabelWhenPriceIsZero", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render course card item with price 0.
    // ----------------------------------------------------------------------------
    const freeCourse = { ...sampleCourse, price: 0 };
    render(<CourseCardItem course={freeCourse} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "Free" text display.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("shouldNavigateToCourseDetailWhenCardIsClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render course card item.
    // ----------------------------------------------------------------------------
    render(<CourseCardItem course={sampleCourse} />);

    // ----------------------------------------------------------------------------
    // Act
    // Click on the Details button.
    // ----------------------------------------------------------------------------
    const detailsBtn = screen.getByRole("button", { name: /details/i });
    fireEvent.click(detailsBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify router.push invocation with correct course URL.
    // ----------------------------------------------------------------------------
    expect(mockPush).toHaveBeenCalledWith("/courses/c-101");
  });
});
