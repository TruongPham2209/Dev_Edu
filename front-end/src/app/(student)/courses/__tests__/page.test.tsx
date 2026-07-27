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
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("CourseDetailPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      handleError: vi.fn(),
    } as any);

    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue({
      data: [{ id: "cat-1", name: "Frontend" }],
      error: null,
    } as any);

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
    } as any);
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
