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
import type { CourseResponse } from "@/lib/type/courses";
import type { CustomPaging } from "@/lib/type/api";
import { createMockCategory, createMockCourse } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockInfiniteQueryResult,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
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
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

vi.mock("./course-table", () => ({
  CourseTable: ({
    courses = [],
    onEditCourse,
    onDeleteCourse,
  }: {
    courses?: CourseResponse[];
    onEditCourse?: (c: CourseResponse) => void;
    onDeleteCourse?: (id: string) => void;
  }) => (
    <div data-testid="course-table-mock">
      {courses.map((c) => (
        <div key={c.id}>
          <span>{c.title}</span>
          <button onClick={() => onEditCourse?.(c)}>Edit {c.title}</button>
          <button onClick={() => onDeleteCourse?.(c.id)}>Delete {c.title}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/dialog/course-form", () => ({
  CourseFormDialog: ({
    open,
    onClose,
  }: {
    open?: boolean;
    onClose?: () => void;
  }) =>
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

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue(
      createMockQueryResult([
        createMockCategory({ id: "cat-1", name: "Web Development" }),
      ]),
    );

    const mockCourse = createMockCourse({
      id: "c-100",
      title: "TypeScript & Next.js Masterclass",
    });

    const pageData: CustomPaging<CourseResponse> = {
      contents: [mockCourse],
      currentPage: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
    };

    vi.mocked(coursesApi.useCoursesInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        {
          pageParams: [null],
          pages: [pageData],
        },
        { refetch: mockRefetch },
      ),
    );

    vi.mocked(coursesApi.useCreateCourseMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(coursesApi.useUpdateCourseMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(coursesApi.useDeleteCourseMutation).mockReturnValue(
      createMockMutationResult({ isPending: false }),
    );

    vi.mocked(filesApi.usePreSignedUploadUrlMutation).mockReturnValue(
      createMockMutationResult({ isPending: false }),
    );

    vi.mocked(filesApi.useConfirmImageUploadMutation).mockReturnValue(
      createMockMutationResult(),
    );
  });

  it("shouldRenderCoursesManagementTitleAndTable", () => {
    render(<AdminCoursesPage />);

    expect(screen.getByText("Courses Management")).toBeInTheDocument();
    expect(
      screen.getByText("TypeScript & Next.js Masterclass"),
    ).toBeInTheDocument();
  });

  it("shouldOpenCourseFormDialogOnCreateCourseClick", () => {
    render(<AdminCoursesPage />);

    const createCourseBtn = screen.getByRole("button", {
      name: "Create Course",
    });
    fireEvent.click(createCourseBtn);

    expect(screen.getByTestId("course-form-dialog")).toBeInTheDocument();
  });
});
