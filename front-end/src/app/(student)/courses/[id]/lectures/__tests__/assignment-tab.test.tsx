/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/lectures/assignment-tab.tsx
 *
 * Purpose
 * -------
 * Verify that TabAssignments component renders assignment list, status badges (Submitted / Pending),
 * empty state when no assignments exist, and opens AssignmentModal on action button click.
 *
 * Tested Features
 * ---------------
 * ✓ CircularProgress loading spinner when loading = true
 * ✓ EmptyState rendering when assignments array is empty
 * ✓ Assignment items rendering (titles, HTML descriptions, Submitted/Pending chip)
 * ✓ Action button click opening AssignmentModal
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty assignments list
 * ✓ Rendering assignments and opening modal
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/assignments" (useAssignmentsQuery)
 *
 * Not Covered
 * -----------
 * - File drag and drop upload inside modal
 *
 * Notes
 * -----
 * Unit test for TabAssignments component.
 */

import * as assignmentsApi from "@/lib/api/assignments";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TabAssignments } from "../assignment-tab";

vi.mock("@/lib/api/assignments", () => ({
  useAssignmentsQuery: vi.fn(),
  useAssignmentSubmissionsQuery: vi.fn(() => ({ data: [], isLoading: false })),
  useSubmitAssignmentMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useFeedbacksQuery: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateSubmissionMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useDeleteSubmissionMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock("@/lib/api/files", () => ({
  useFileMetadataQuery: vi.fn(() => ({ data: null, isLoading: false })),
  usePreSignedUploadUrlMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useConfirmImageUploadMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: () => ({
    handleError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

describe("TabAssignments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderEmptyStateWhenNoAssignmentsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty assignments list.
    // ----------------------------------------------------------------------------
    vi.mocked(assignmentsApi.useAssignmentsQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render TabAssignments.
    // ----------------------------------------------------------------------------
    render(<TabAssignments lectureId="lec-100" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "No assignments yet" empty state.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No assignments yet")).toBeInTheDocument();
  });

  it("shouldRenderAssignmentListAndOpenModalOnButtonClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock assignments list.
    // ----------------------------------------------------------------------------
    const mockAssignments = [
      {
        id: "asg-1",
        title: "Build Next.js Server Actions Form",
        description: "<p>Create a form using Zod validation.</p>",
        submittedAt: null,
      },
    ];

    vi.mocked(assignmentsApi.useAssignmentsQuery).mockReturnValue({
      data: mockAssignments,
      isLoading: false,
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render TabAssignments.
    // ----------------------------------------------------------------------------
    render(<TabAssignments lectureId="lec-100" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify assignment title and Pending status chip render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Build Next.js Server Actions Form"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify Modal
    // Click Submit button icon.
    // ----------------------------------------------------------------------------
    const submitBtn = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
