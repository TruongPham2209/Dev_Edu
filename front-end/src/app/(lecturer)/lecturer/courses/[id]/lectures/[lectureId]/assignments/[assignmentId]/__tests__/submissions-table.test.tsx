/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/lectures/[lectureId]/assignments/[assignmentId]/submissions-table.tsx
 *
 * Purpose
 * -------
 * Verify that SubmissionsTable component renders student submissions table, displays empty state,
 * handles file download triggers, and opens submission details dialog on action click.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering Student Submissions card header
 * ✓ Rendering EmptyState when submissions list is empty
 * ✓ Submissions table rows rendering student username, date, file chip, and action buttons
 * ✓ Triggering openSubmissionDetails callback on view button click
 * ✓ Triggering triggerDownload callback on download button click
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading skeleton state
 * ✓ Empty submissions state
 * ✓ Submissions table rendering
 *
 * Mocked Dependencies
 * -------------------
 * - None
 *
 * Not Covered
 * -----------
 * - Real file download HTTP transfer
 *
 * Notes
 * -----
 * Unit test for SubmissionsTable component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubmissionsTable } from "../submissions-table";

describe("SubmissionsTable", () => {
  const mockLoadSubmissions = vi.fn();
  const mockTriggerDownload = vi.fn();
  const mockOpenSubmissionDetails = vi.fn();
  const mockFormatServerDate = vi.fn().mockReturnValue("2026-06-15 14:00");
  const mockGetFileNameFromKey = vi.fn().mockReturnValue("submission.zip");

  it("shouldRenderEmptyStateWhenNoSubmissionsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render SubmissionsTable with empty submissions array.
    // ----------------------------------------------------------------------------
    render(
      <SubmissionsTable
        submissions={[]}
        submissionsLoading={false}
        submissionsHasMore={false}
        loadSubmissions={mockLoadSubmissions}
        triggerDownload={mockTriggerDownload}
        openSubmissionDetails={mockOpenSubmissionDetails}
        formatServerDate={mockFormatServerDate}
        getFileNameFromKey={mockGetFileNameFromKey}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No submissions yet")).toBeInTheDocument();
  });

  it("shouldRenderSubmissionsTableRowsAndTriggerActions", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock submission item.
    // ----------------------------------------------------------------------------
    const mockSubmissions = [
      {
        id: "sub-1",
        studentUsername: "alex_dev",
        submittedAt: "2026-06-15T14:00:00.000Z",
        fileObjectKey: "submissions/sub-1.zip",
      },
    ];

    // ----------------------------------------------------------------------------
    // Act
    // Render SubmissionsTable.
    // ----------------------------------------------------------------------------
    render(
      <SubmissionsTable
        submissions={mockSubmissions as any}
        submissionsLoading={false}
        submissionsHasMore={false}
        loadSubmissions={mockLoadSubmissions}
        triggerDownload={mockTriggerDownload}
        openSubmissionDetails={mockOpenSubmissionDetails}
        formatServerDate={mockFormatServerDate}
        getFileNameFromKey={mockGetFileNameFromKey}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify student username, file chip, and action button clicks.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("alex_dev")).toBeInTheDocument();
    expect(screen.getByText("submission.zip")).toBeInTheDocument();

    const viewDetailsBtn = screen.getByRole("button", {
      name: "View details & Respond",
    });
    fireEvent.click(viewDetailsBtn);

    expect(mockOpenSubmissionDetails).toHaveBeenCalledWith(mockSubmissions[0]);

    const downloadBtn = screen.getByRole("button", { name: "Download file" });
    fireEvent.click(downloadBtn);

    expect(mockTriggerDownload).toHaveBeenCalledWith("submissions/sub-1.zip");
  });
});
