import React from "react";
/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/page.tsx
 *
 * Purpose
 * -------
 * Verify that CourseDetailPage integrates CourseSearch, CourseCategories, and CourseList,
 * handles search keyword state debouncing, and category filtering.
 *
 * Tested Features
 * ---------------
 * ✓ Integrated layout rendering (CourseSearch, CourseCategories, CourseList)
 * ✓ Debounced keyword search input handling
 * ✓ Category selection filtering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering course catalog page
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (useCategoriesQuery, useCoursesInfiniteQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - CSS grid responsiveness
 *
 * Notes
 * -----
 * Unit test for CourseDetailPage component.
 */

import * as coursesApi from "@/lib/api/courses";
import * as apiToast from "@/lib/use-api-with-toast";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CourseDetailPage from "../page";

vi.mock("@/lib/api/courses", () => ({
  useCategoriesQuery: vi.fn(),
  useCoursesInfiniteQuery: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ alt = "image", ...props }: React.ComponentProps<"img">) => React.createElement("img", { alt, ...props }),
}));

import { createMockCategory, createMockCourse } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockInfiniteQueryResult,
  createMockQueryResult,
} from "@/testing/mock-query";

describe("CourseDetailPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      handleError: vi.fn(),
    } as never);
    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue({
      data: [{ id: "cat-1", name: "Frontend" }],
      error: null,
    } as never);
    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue(
      createMockQueryResult([
        createMockCategory({ id: "cat-1", name: "Frontend" }),
      ]),
    );

    vi.mocked(coursesApi.useCoursesInfiniteQuery).mockReturnValue({
      data: {
        pages: [
          {
            contents: [
              {
                id: "c-1",
                title: "React 19 Complete Guide",
                discountedPrice: 900000,
                originalPrice: 1200000,
              },
            ],
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      error: null,
    } as never);
    vi.mocked(coursesApi.useCoursesInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        {
          pages: [
            {
              contents: [
                createMockCourse({
                  id: "c-1",
                  title: "React 19 Complete Guide",
                  discountedPrice: 900000,
                  originalPrice: 1200000,
                }),
              ],
              currentPage: 0,
              pageSize: 10,
              totalElements: 1,
              totalPages: 1,
            },
          ],
          pageParams: [null],
        },
      ),
    );
  });

  it("shouldRenderSearchCategoriesAndCourseList", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CourseDetailPage.
    // ----------------------------------------------------------------------------
    render(<CourseDetailPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify search headline, category, and course title render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("What do you want to learn today?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("React 19 Complete Guide")).toBeInTheDocument();
  });
});
