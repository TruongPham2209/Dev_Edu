import React from "react";
/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/course-hero.tsx
 *
 * Purpose
 * -------
 * Verify that CourseHero component renders breadcrumbs navigation and CourseHeroInfo component.
 *
 * Tested Features
 * ---------------
 * ✓ Breadcrumbs navigation rendering Dashboard link and active course title
 * ✓ Passing course data to CourseHeroInfo component
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering course hero header section
 *
 * Mocked Dependencies
 * -------------------
 * - "@/components/common/hero-section/course-hero-info" (mocked CourseHeroInfo)
 * - "next/link" (mocked Link)
 *
 * Not Covered
 * -----------
 * - Internal styling of CourseHeroInfo
 *
 * Notes
 * -----
 * Unit test for CourseHero component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMockCourse } from "@/testing/mock-data";
import { CourseHero } from "../course-hero";

vi.mock("@/components/common/hero-section/course-hero-info", () => ({
  CourseHeroInfo: ({ course }: { course?: { title?: string } }) => (
    <div data-testid="course-hero-info">{course?.title}</div>
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children?: React.ReactNode; href?: string }) => <a href={href}>{children}</a>,
}));

describe("CourseHero", () => {
  it("shouldRenderBreadcrumbsAndCourseHeroInfo", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock course response.
    // ----------------------------------------------------------------------------
    const mockCourse = createMockCourse({
      id: "course-123",
      title: "Advanced System Architecture",
      description: "Learn distributed systems design.",
      thumbnailUrl: "https://example.com/thumb.jpg",
      createdAt: "2026-06-01T00:00:00.000Z",
    });

    // ----------------------------------------------------------------------------
    // Act
    // Render CourseHero.
    // ----------------------------------------------------------------------------
    render(<CourseHero course={mockCourse} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify breadcrumbs and CourseHeroInfo render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("course-hero-info")).toHaveTextContent(
      "Advanced System Architecture",
    );
  });
});
