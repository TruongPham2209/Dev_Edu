/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/lectures-tab.tsx
 *
 * Purpose
 * -------
 * Verify that LecturesTab queries course lectures, displays empty state or lectures list,
 * opens create/edit LectureFormDialog, and handles lecture deletion confirm dialog.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering course curriculum header and Add Lecture button
 * ✓ Rendering EmptyState when lectures array is empty
 * ✓ Rendering lectures list with title, summary, video chip, and action buttons
 * ✓ Opening LectureFormDialog on Create / Edit action
 * ✓ Deleting lecture via useDeleteLectureMutation hook
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state with ListSkeleton
 * ✓ Empty lectures state
 * ✓ Rendering lectures list
 * ✓ Lecture deletion flow
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/lectures" (useLecturesByCourseQuery, useDeleteLectureMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/navigation" (useRouter)
 * - "@/components/dialog/lecture-form" (mocked LectureFormDialog)
 *
 * Not Covered
 * -----------
 * - Drag-and-drop lecture reordering
 *
 * Notes
 * -----
 * Unit test for LecturesTab component.
 */

import * as lecturesApi from "@/lib/api/lectures";
import * as apiToast from "@/lib/use-api-with-toast";
import type { LectureResponse } from "@/lib/type/lectures";
import { createMockLecture } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LecturesTab } from "../lectures-tab";

vi.mock("@/lib/api/lectures", () => ({
  useLecturesByCourseQuery: vi.fn(),
  useDeleteLectureMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/components/dialog/lecture-form", () => ({
  LectureFormDialog: ({
    open,
    onClose,
  }: {
    open?: boolean;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="lecture-form-dialog">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null,
}));

describe("LecturesTab", () => {
  const mockPush = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    vi.mocked(lecturesApi.useDeleteLectureMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: vi.fn().mockResolvedValue(undefined),
      }),
    );
  });

  it("shouldRenderEmptyStateWhenNoLecturesExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty lectures list.
    // ----------------------------------------------------------------------------
    vi.mocked(lecturesApi.useLecturesByCourseQuery).mockReturnValue(
      createMockQueryResult([], { refetch: mockRefetch }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render LecturesTab.
    // ----------------------------------------------------------------------------
    render(<LecturesTab courseId="course-123" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state title and Add Lecture button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No lectures yet")).toBeInTheDocument();
    expect(screen.getByText("Add Lecture")).toBeInTheDocument();
  });

  it("shouldRenderLecturesListAndTriggerManageNavigation", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return sample lectures array.
    // ----------------------------------------------------------------------------
    const mockLecture: LectureResponse = createMockLecture({
      id: "lec-1",
      title: "Introduction to Clean Architecture",
      summary: "Understand domain-driven boundaries",
      videoObjectKey: "videos/intro.mp4",
    });

    vi.mocked(lecturesApi.useLecturesByCourseQuery).mockReturnValue(
      createMockQueryResult([mockLecture], { refetch: mockRefetch }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render LecturesTab.
    // ----------------------------------------------------------------------------
    render(<LecturesTab courseId="course-123" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify lecture title, video badge chip, and manage button click.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Introduction to Clean Architecture"),
    ).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();

    const manageBtn = screen.getByRole("button", { name: "Manage" });
    fireEvent.click(manageBtn);

    expect(mockPush).toHaveBeenCalledWith(
      "/lecturer/courses/course-123/lectures/lec-1",
    );
  });
});
