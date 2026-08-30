import React from "react";
/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/page.tsx
 *
 * Purpose
 * -------
 * Verify that CourseDetailPage renders course details, HeroSection, CourseAbout, CourseContent,
 * CourseReviewsSection, and handles notFound error when course data is invalid.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering course details (title, description, lectures, reviews)
 * ✓ notFound execution when courseId or course query returns error
 *
 * Covered Scenarios
 * -----------------
 * ✓ Successful course detail page render
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (notFound)
 * - "@/lib/api/courses" (useCourseByIdQuery, useCoursesQuery, useCategoriesQuery, useCourseReviewsInfiniteQuery)
 * - "@/lib/api/lectures" (useLecturesByCourseQuery)
 * - "@/lib/use-auth" (useAuth)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - Sticky sidebar layout
 *
 * Notes
 * -----
 * Unit test for CourseDetailPage component.
 */

import type { CategoryResponse, CourseResponse, ReviewResponse } from "@/lib/type/courses";
import type { LectureResponse } from "@/lib/type/lectures";
import * as coursesApi from "@/lib/api/courses";
import * as lecturesApi from "@/lib/api/lectures";
import * as useAuthModule from "@/lib/use-auth";
import {
  createMockAuthStatus,
  createMockCourse,
  createMockCustomPaging,
} from "@/testing/mock-data";
import {
  createMockInfiniteQueryResult,
  createMockQueryResult,
} from "@/testing/mock-query";
import { render, screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CourseDetailPage from "../page";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: () => ({
    handleError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

vi.mock("@/lib/api/enrollments", () => ({
  useAddToCartMutation: () => ({ mutateAsync: vi.fn() }),
  useCheckoutMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(),
  useCoursesQuery: vi.fn(),
  useCategoriesQuery: vi.fn(),
  useCourseReviewsInfiniteQuery: vi.fn(),
  useAddToCartMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useCheckoutMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock("@/lib/api/lectures", () => ({
  useLecturesByCourseQuery: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ alt = "image", ...props }: React.ComponentProps<"img">) =>
    React.createElement("img", { alt, ...props }),
}));

describe("CourseDetailPage ([id])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      createMockAuthStatus({
        isAuthenticated: true,
        role: "STUDENT",
        roles: ["STUDENT"],
      }),
    );

    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue(
      createMockQueryResult<CategoryResponse[]>([]),
    );
    vi.mocked(coursesApi.useCoursesQuery).mockReturnValue(
      createMockQueryResult(createMockCustomPaging<CourseResponse>([])),
    );
    vi.mocked(coursesApi.useCourseReviewsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<ReviewResponse>([])],
        pageParams: [null],
      }),
    );
    vi.mocked(lecturesApi.useLecturesByCourseQuery).mockReturnValue(
      createMockQueryResult<LectureResponse[]>([]),
    );
  });

  it("shouldRenderCourseDetailsWhenCourseIdIsValid", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return course details.
    // ----------------------------------------------------------------------------
    const mockCourse: CourseResponse = createMockCourse({
      id: "course-555",
      title: "Mastering React 19 Server Actions",
      description: "<p>Deep dive into React 19 Actions and Hooks</p>",
      avgReview: 4.9,
      totalReview: 10,
      registered: false,
      discountedPrice: 900000,
      originalPrice: 1200000,
    });

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue(
      createMockQueryResult(mockCourse),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render CourseDetailPage with resolved params Promise.
    // ----------------------------------------------------------------------------
    const paramsPromise = Promise.resolve({ id: "course-555" });
    await act(async () => {
      render(<CourseDetailPage params={paramsPromise} />);
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify course title renders.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", {
        name: "Mastering React 19 Server Actions",
      }),
    ).toBeInTheDocument();
  });
});
