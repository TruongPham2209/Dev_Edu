/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/home/featured-courses.tsx
 *
 * Purpose
 * -------
 * Verify that FeaturedCoursesSection fetches featured courses data and renders CourseCards,
 * handles API failure by showing ErrorState, and FeaturedCoursesFallback renders skeleton cards.
 *
 * Tested Features
 * ---------------
 * ✓ FeaturedCoursesSection rendering list of CourseCards
 * ✓ Error handling displaying ErrorState when getFeaturedCourses fails
 * ✓ FeaturedCoursesFallback rendering skeleton placeholder cards
 *
 * Covered Scenarios
 * -----------------
 * ✓ Successful API resolution
 * ✓ API rejection (ErrorState)
 * ✓ Loading fallback skeleton
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (getFeaturedCourses)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - CSS grid layout responsiveness
 *
 * Notes
 * -----
 * Unit test for FeaturedCoursesSection and FeaturedCoursesFallback.
 */

import * as coursesApi from "@/lib/api/courses";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FeaturedCoursesFallback,
  FeaturedCoursesSection,
} from "../featured-courses";

vi.mock("@/lib/api/courses", () => ({
  getFeaturedCourses: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("FeaturedCoursesSection & Fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderFeaturedCoursesListOnSuccess", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock getFeaturedCourses resolution.
    // ----------------------------------------------------------------------------
    const mockCourses = [
      {
        id: "fc-1",
        title: "Fullstack Web Development 2026",
        originalPrice: 1200000,
        discountedPrice: 900000,
        rating: 4.8,
      },
    ];

    vi.mocked(coursesApi.getFeaturedCourses).mockResolvedValue(
      mockCourses as any,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render async FeaturedCoursesSection.
    // ----------------------------------------------------------------------------
    const component = await FeaturedCoursesSection();
    render(component);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify course title renders.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Fullstack Web Development 2026"),
    ).toBeInTheDocument();
  });

  it("shouldRenderErrorStateWhenApiFails", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock API error.
    // ----------------------------------------------------------------------------
    vi.mocked(coursesApi.getFeaturedCourses).mockRejectedValue(
      new Error("Network Error"),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render component on error.
    // ----------------------------------------------------------------------------
    const component = await FeaturedCoursesSection();
    render(component);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error state title.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Failed to load featured courses"),
    ).toBeInTheDocument();
  });

  it("shouldRenderFallbackSkeletonCards", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render fallback component.
    // ----------------------------------------------------------------------------
    render(<FeaturedCoursesFallback />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify fallback renders.
    // ----------------------------------------------------------------------------
    expect(document.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });
});
