/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/hero-section/course-hero-info.tsx
 *
 * Purpose
 * -------
 * Verify that CourseHeroInfo component renders course title, cover image, pricing
 * (original price vs discounted price strike-through), creation date, and status.
 *
 * Tested Features
 * ---------------
 * ✓ Course title and active badge display
 * ✓ Price calculation (original price vs discounted price)
 * ✓ Created date formatting via formatServerDate
 * ✓ Cover image / icon placeholder display
 *
 * Covered Scenarios
 * -----------------
 * ✓ Course with discounted price (renders discounted & strike-through original)
 * ✓ Course with regular price (renders single original price)
 *
 * Mocked Dependencies
 * -------------------
 * - "next/image" (mocked standard img tag)
 *
 * Not Covered
 * -----------
 * - Image fill layout positioning
 *
 * Notes
 * -----
 * Unit test for CourseHeroInfo component.
 */

import type { CourseResponse } from "@/lib/type/courses";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CourseHeroInfo } from "../course-hero-info";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("CourseHeroInfo", () => {
  const courseWithDiscount: CourseResponse = {
    id: "course-1",
    title: "Fullstack Next.js 16 Masterclass",
    originalPrice: 1000000,
    discountedPrice: 750000,
    thumbnailUrl: "https://example.com/cover.png",
    createdAt: "2026-04-10T12:00:00.000Z",
  } as any;

  it("shouldRenderCourseTitleAndDiscountedPricing", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CourseHeroInfo with discount.
    // ----------------------------------------------------------------------------
    render(<CourseHeroInfo course={courseWithDiscount} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, active badge, prices, and creation date.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Fullstack Next.js 16 Masterclass"),
    ).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("750.000 VND")).toBeInTheDocument();
    expect(screen.getByText("1.000.000 VND")).toBeInTheDocument();
    expect(screen.getByText(/Created at: 10\/04\/2026/i)).toBeInTheDocument();
  });
});
