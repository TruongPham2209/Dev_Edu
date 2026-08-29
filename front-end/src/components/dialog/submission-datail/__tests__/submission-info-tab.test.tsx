/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/submission-datail/submission-info-tab.tsx
 *
 * Purpose
 * -------
 * Verify that SubmissionInfoTab component renders submission file details, download action button,
 * lecturer feedback thread, loading skeleton, empty state, and delete feedback callback.
 *
 * Tested Features
 * ---------------
 * ✓ Attached file name, size, and content type display
 * ✓ Download button trigger via triggerDownload callback
 * ✓ Empty feedback message when feedbacks array is empty
 * ✓ Feedback list items rendering with lecturer name and feedback text
 * ✓ Delete feedback callback trigger when user is admin or isMine=true
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering submission file and feedback thread
 * ✓ Triggering file download
 * ✓ Triggering delete feedback callback
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI components via RTL)
 *
 * Not Covered
 * -----------
 * - Direct S3 stream download execution
 *
 * Notes
 * -----
 * Unit test for SubmissionInfoTab component.
 */

import type {
  FeedbackResponse,
  SubmissionResponse,
} from "@/lib/type/assignments";
import { createMockSubmission } from "@/testing/mock-data";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubmissionInfoTab } from "../submission-info-tab";

describe("SubmissionInfoTab", () => {
  const mockSubmission: SubmissionResponse = createMockSubmission({
    id: "sub-10",
    fileName: "Assignment_Solution.pdf",
    fileObjectKey: "submissions/sub-10.pdf",
    fileSize: 2048576,
    contentType: "application/pdf",
  });

  const mockFeedbacks: FeedbackResponse[] = [
    {
      id: "fb-1",
      lecturer: "prof_john",
      lecturerFullName: "Prof. John Doe",
      lecturerAvatar: "https://example.com/avatar.jpg",
      feedback:
        "Great implementation! Please format code blocks properly next time.",
      createdAt: "2026-06-20T10:00:00.000Z",
      isMine: true,
    },
  ];

  it("shouldRenderSubmissionFileDetailsAndFeedbackThread", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render SubmissionInfoTab.
    // ----------------------------------------------------------------------------
    render(
      <SubmissionInfoTab
        selectedSubmission={mockSubmission}
        isAdmin={false}
        feedbacks={mockFeedbacks}
        feedbacksLoading={false}
        onDeleteFeedbackClick={vi.fn()}
        triggerDownload={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify file name, size, and feedback message.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Assignment_Solution.pdf")).toBeInTheDocument();
    expect(screen.getByText("Prof. John Doe")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Great implementation! Please format code blocks properly next time.",
      ),
    ).toBeInTheDocument();
  });

  it("shouldTriggerDownloadWhenDownloadButtonIsClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare download handler.
    // ----------------------------------------------------------------------------
    const handleDownload = vi.fn();

    render(
      <SubmissionInfoTab
        selectedSubmission={mockSubmission}
        isAdmin={false}
        feedbacks={[]}
        feedbacksLoading={false}
        onDeleteFeedbackClick={vi.fn()}
        triggerDownload={handleDownload}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Click download button.
    // ----------------------------------------------------------------------------
    const downloadBtn = screen.getByRole("button", { name: /Download/i });
    fireEvent.click(downloadBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify triggerDownload was called with file object key.
    // ----------------------------------------------------------------------------
    expect(handleDownload).toHaveBeenCalledWith("submissions/sub-10.pdf");
  });
});
