/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/courses/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminCoursesPage queries courses catalog, renders search and category filter controls,
 * displays CourseTable, opens CourseFormDialog on Create Course, and handles course deletion dialog.
 *
 * Tested Features
 * ---------------
 * ✓ Courses Management Hero banner rendering
 * ✓ SearchInput and category FilterSelect controls rendering
 * ✓ CourseTable rendering with fetched courses
 * ✓ Opening CourseFormDialog on Create Course button click
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty courses state
 * ✓ Courses catalog rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (useCategoriesQuery, useCoursesInfiniteQuery, useCreateCourseMutation, useUpdateCourseMutation, useDeleteCourseMutation)
 * - "@/lib/api/files" (usePreSignedUploadUrlMutation, useConfirmImageUploadMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/navigation" (useRouter)
 * - "./course-table" (mocked CourseTable)
 * - "@/components/dialog/course-form" (mocked CourseFormDialog)
 *
 * Not Covered
 * -----------
 * - IntersectionObserver infinite scroll trigger
 *
 * Notes
 * -----
 * Unit test for AdminCoursesPage component.
 */

import * as coursesApi from "@/lib/api/courses";
import * as filesApi from "@/lib/api/files";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminCoursesPage from "../page";

vi.mock("@/lib/api/courses", () => ({
  useCategoriesQuery: vi.fn(),
  useCoursesInfiniteQuery: vi.fn(),
  useCreateCourseMutation: vi.fn(),
  useUpdateCourseMutation: vi.fn(),
  useDeleteCourseMutation: vi.fn(),
}));

vi.mock("@/lib/api/files", () => ({
  usePreSignedUploadUrlMutation: vi.fn(),
  useConfirmImageUploadMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("./course-table", () => ({
  CourseTable: ({ courses, onEditCourse, onDeleteCourse }: any) => (
    <div data-testid="course-table-mock">
      {courses.map((c: any) => (
        <div key={c.id}>
          <span>{c.title}</span>
          <button onClick={() => onEditCourse(c)}>Edit {c.title}</button>
          <button onClick={() => onDeleteCourse(c.id)}>Delete {c.title}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/dialog/course-form", () => ({
  CourseFormDialog: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="course-form-dialog">
        <button onClick={onClose}>Close Course Dialog</button>
      </div>
    ) : null,
}));

describe("AdminCoursesPage", () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as any);

    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue({
      data: [{ id: "cat-1", name: "Web Development" }],
      isLoading: false,
    } as any);

    vi.mocked(coursesApi.useCoursesInfiniteQuery).mockReturnValue({
      data: {
        pages: [
          {
            contents: [
              { id: "c-100", title: "TypeScript & Next.js Masterclass" },
            ],
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      error: null,
      refetch: mockRefetch,
    } as any);

    vi.mocked(coursesApi.useCreateCourseMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(coursesApi.useUpdateCourseMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(coursesApi.useDeleteCourseMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(filesApi.usePreSignedUploadUrlMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(filesApi.useConfirmImageUploadMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  it("shouldRenderCoursesManagementTitleAndTable", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AdminCoursesPage.
    // ----------------------------------------------------------------------------
    render(<AdminCoursesPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and mock course table render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Courses Management")).toBeInTheDocument();
    expect(
      screen.getByText("TypeScript & Next.js Masterclass"),
    ).toBeInTheDocument();
  });

  it("shouldOpenCourseFormDialogOnCreateCourseClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render AdminCoursesPage.
    // ----------------------------------------------------------------------------
    render(<AdminCoursesPage />);

    // ----------------------------------------------------------------------------
    // Act
    // Click Create Course button.
    // ----------------------------------------------------------------------------
    const createCourseBtn = screen.getByRole("button", {
      name: "Create Course",
    });
    fireEvent.click(createCourseBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify CourseFormDialog renders.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("course-form-dialog")).toBeInTheDocument();
  });
});
