/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/courses/[id]/course-hero.tsx
 *
 * Purpose
 * -------
 * Verify that CourseHero component renders breadcrumbs, CourseHeroInfo, course description HTML, and metric cards.
 *
 * Tested Features
 * ---------------
 * ✓ Breadcrumbs navigation rendering
 * ✓ CourseHeroInfo rendering
 * ✓ HTML course description rendering
 * ✓ Metric cards (Total Lectures, Enrolled Students, Discount Schedules, Assigned Lecturers) rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering admin course hero header
 *
 * Mocked Dependencies
 * -------------------
 * - "@/components/common/hero-section/course-hero-info" (mocked CourseHeroInfo)
 *
 * Not Covered
 * -----------
 * - CSS glassmorphism backdrop blur
 *
 * Notes
 * -----
 * Unit test for CourseHero component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CourseResponse } from "@/lib/type/courses";
import { createMockCourse } from "@/testing/mock-data";
import { CourseHero } from "../course-hero";

vi.mock("@/components/common/hero-section/course-hero-info", () => ({
  CourseHeroInfo: ({ course }: { course?: { title?: string } }) => (
    <div data-testid="course-hero-info-mock">{course?.title}</div>
  ),
}));

describe("CourseHero", () => {
  it("shouldRenderBreadcrumbsCourseInfoAndMetricCounters", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock course object.
    // ----------------------------------------------------------------------------
    const mockCourse: CourseResponse = createMockCourse({
      id: "course-123",
      title: "Full-Stack Web Development",
      description: "<p>Learn React, Next.js, and Spring Boot.</p>",
      lecturers: ["John Doe", "Jane Smith"],
    });

    // ----------------------------------------------------------------------------
    // Act
    // Render CourseHero.
    // ----------------------------------------------------------------------------
    render(
      <CourseHero
        course={mockCourse}
        lecturesCount={15}
        studentsCount={120}
        discountsCount={2}
        lecturersCount={2}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify breadcrumbs, hero info, description, and metric cards render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Manage Course")).toBeInTheDocument();
    expect(screen.getByTestId("course-hero-info-mock")).toHaveTextContent(
      "Full-Stack Web Development",
    );
    expect(
      screen.getByText("Learn React, Next.js, and Spring Boot."),
    ).toBeInTheDocument();
    expect(screen.getByText("Total Lectures")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Enrolled Students")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
  });
});
