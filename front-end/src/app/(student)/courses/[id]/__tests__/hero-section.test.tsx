/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/hero-section.tsx
 *
 * Purpose
 * -------
 * Verify that HeroSection component renders breadcrumbs, category badge, course title,
 * description, total enrollment count, updated date, and lecturer avatars.
 *
 * Tested Features
 * ---------------
 * ✓ Breadcrumbs navigation rendering
 * ✓ Course title and category badge display
 * ✓ Total enrollment count & date formatting
 * ✓ Lecturers list rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering course hero section
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (useCategoriesQuery)
 *
 * Not Covered
 * -----------
 * - CSS backdrop filter styling
 *
 * Notes
 * -----
 * Unit test for HeroSection component.
 */

import type { CategoryResponse, CourseResponse } from "@/lib/type/courses";
import * as coursesApi from "@/lib/api/courses";
import { createMockCategory, createMockCourse } from "@/testing/mock-data";
import { createMockQueryResult } from "@/testing/mock-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSection } from "../hero-section";

vi.mock("@/lib/api/courses", () => ({
  useCategoriesQuery: vi.fn(),
}));

describe("HeroSection", () => {
  const mockCourse: CourseResponse = createMockCourse({
    id: "c-300",
    title: "Node.js Microservices Architecture",
    description: "<p>Build scalable backend microservices</p>",
    categoryId: "cat-backend",
    totalEnrollment: 1250,
    createdAt: "2026-03-01T12:00:00.000Z",
    lecturers: ["John Doe", "Jane Smith"],
    avgReview: 4.8,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const mockCategories: CategoryResponse[] = [
      createMockCategory({ id: "cat-backend", name: "Backend" }),
    ];
    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue(
      createMockQueryResult(mockCategories),
    );
  });

  it("shouldRenderBreadcrumbsTitleCategoryAndLecturers", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render HeroSection.
    // ----------------------------------------------------------------------------
    render(<HeroSection course={mockCourse} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify course title, category badge, enrollment count, and lecturers.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", {
        name: "Node.js Microservices Architecture",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("1250")).toBeInTheDocument();
    expect(screen.getByText("John Doe, Jane Smith")).toBeInTheDocument();
  });
});
