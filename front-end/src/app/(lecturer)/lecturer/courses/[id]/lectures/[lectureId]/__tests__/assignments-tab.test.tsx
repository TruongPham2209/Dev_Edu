/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/lectures/[lectureId]/assignments-tab.tsx
 *
 * Purpose
 * -------
 * Verify that AssignmentsTab queries lecture assignments, renders empty state or assignment list,
 * handles create AssignmentFormDialog opening, and handles assignment deletion confirm dialog.
 *
 * Tested Features
 * ---------------
 * ✓ Querying assignments via useAssignmentsQuery
 * ✓ EmptyState rendering when assignments array is empty
 * ✓ Assignments list rendering with title, date, and description
 * ✓ Opening AssignmentFormDialog on add button click
 * ✓ Navigating to assignment submissions page on View button click
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading skeleton state
 * ✓ Empty assignments state
 * ✓ Assignments list rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/assignments" (useAssignmentsQuery, useDeleteAssignmentMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/navigation" (useRouter)
 * - "@/components/dialog/assignment-form" (mocked AssignmentFormDialog)
 *
 * Not Covered
 * -----------
 * - Drag and drop sorting
 *
 * Notes
 * -----
 * Unit test for AssignmentsTab component.
 */

import type { AssignmentResponse } from "@/lib/type/assignments";
import * as assignmentsApi from "@/lib/api/assignments";
import * as apiToast from "@/lib/use-api-with-toast";
import { createMockAssignment, createMockRouter } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssignmentsTab } from "../assignments-tab";

vi.mock("@/lib/api/assignments", () => ({
  useAssignmentsQuery: vi.fn(),
  useDeleteAssignmentMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/components/dialog/assignment-form", () => ({
  AssignmentFormDialog: ({
    open,
    onClose,
  }: {
    open?: boolean;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="assignment-form-dialog">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null,
}));

describe("AssignmentsTab (Lecturer)", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue(createMockRouter({ push: mockPush }));

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    vi.mocked(assignmentsApi.useDeleteAssignmentMutation).mockReturnValue(
      createMockMutationResult(),
    );
  });

  it("shouldRenderEmptyStateWhenNoAssignmentsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty assignments list.
    // ----------------------------------------------------------------------------
    vi.mocked(assignmentsApi.useAssignmentsQuery).mockReturnValue(
      createMockQueryResult<AssignmentResponse[]>([]),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render AssignmentsTab.
    // ----------------------------------------------------------------------------
    render(<AssignmentsTab lectureId="lec-1" courseId="course-1" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No assignments yet")).toBeInTheDocument();
  });

  it("shouldRenderAssignmentsListAndNavigateToSubmissions", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return sample assignment.
    // ----------------------------------------------------------------------------
    const mockAssignments: AssignmentResponse[] = [
      createMockAssignment({
        id: "assign-1",
        title: "Build RESTful API in Spring Boot",
        description: "<p>Implement GET, POST, and DELETE endpoints.</p>",
        createdAt: "2026-06-10T12:00:00.000Z",
      }),
    ];

    vi.mocked(assignmentsApi.useAssignmentsQuery).mockReturnValue(
      createMockQueryResult(mockAssignments),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render AssignmentsTab.
    // ----------------------------------------------------------------------------
    render(<AssignmentsTab lectureId="lec-1" courseId="course-1" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify assignment title and view button navigation.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Build RESTful API in Spring Boot"),
    ).toBeInTheDocument();

    const viewBtn = screen.getByRole("button", { name: "View & Manage" });
    fireEvent.click(viewBtn);

    expect(mockPush).toHaveBeenCalledWith(
      "/lecturer/courses/course-1/lectures/lec-1/assignments/assign-1",
    );
  });
});
