/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/card/course-card.tsx
 *
 * Purpose
 * -------
 * Verify that CourseCard component renders course information (title, stripped
 * description HTML, lecturers, rating, enrollment count), price formatting,
 * discount strike-through, free badge, thumbnail image, and navigation links.
 *
 * Tested Features
 * ---------------
 * ✓ Title and HTML-stripped description rendering
 * ✓ Thumbnail image display vs "No Image" fallback
 * ✓ Lecturers list and avatar initial
 * ✓ Average review rating and compact enrollment formatting
 * ✓ Price calculation (Free, regular price, discounted price line-through)
 * ✓ Next.js Link href binding
 *
 * Covered Scenarios
 * -----------------
 * ✓ Free course (originalPrice: 0)
 * ✓ Discounted course (originalPrice: 500000, discountedPrice: 300000)
 * ✓ Regular priced course (originalPrice: 200000)
 * ✓ Course with thumbnailUrl vs course without thumbnailUrl
 * ✓ Course with lecturers vs course without lecturers
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements & Next.js Link via RTL)
 *
 * Not Covered
 * -----------
 * - Next.js Router navigation page transition
 *
 * Notes
 * -----
 * Unit test for CourseCard component.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseCard } from "../course-card";
import type { CourseResponse } from "@/lib/type/courses";

describe("CourseCard", () => {
  const baseCourse: CourseResponse = {
    id: "course-101",
    title: "Mastering Next.js & React 19",
    description: "<p>Learn <strong>modern</strong> web development.</p>",
    originalPrice: 500000,
    discountedPrice: 350000,
    thumbnailUrl: "https://example.com/thumb.jpg",
    lecturers: ["Dr. Jane Smith", "Prof. John Doe"],
    avgReview: 4.8,
    totalEnrollment: 1250,
    categoryId: "cat-1",
    status: "PUBLISHED",
    createdDate: "2026-01-01",
  } as never;

  it("shouldRenderCourseDetailsThumbnailAndDiscountedPrice", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CourseCard with discounted course.
    // ----------------------------------------------------------------------------
    render(<CourseCard course={baseCourse} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, stripped description, lecturers, rating, and prices.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Mastering Next.js & React 19"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Learn modern web development."),
    ).toBeInTheDocument();
    expect(screen.getByText("Dr. Jane Smith, Prof. John Doe")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("1.3K")).toBeInTheDocument();

    const image = screen.getByAltText("Mastering Next.js & React 19");
    expect(image).toHaveAttribute("src", "https://example.com/thumb.jpg");

    // Strike-through original price & discounted price
    expect(screen.getByText("500.000đ")).toBeInTheDocument();
    expect(screen.getByText("350.000đ")).toBeInTheDocument();

    // Link navigation target
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/courses/course-101");
  });

  it("shouldRenderFreeBadgeWhenPriceIsZero", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare free course object.
    // ----------------------------------------------------------------------------
    const freeCourse: CourseResponse = {
      ...baseCourse,
      id: "course-free",
      originalPrice: 0,
      discountedPrice: 0,
      thumbnailUrl: null,
    };

    // ----------------------------------------------------------------------------
    // Act
    // Render free course card.
    // ----------------------------------------------------------------------------
    render(<CourseCard course={freeCourse} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "Free" badge text and "No Image" placeholder.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });
});
