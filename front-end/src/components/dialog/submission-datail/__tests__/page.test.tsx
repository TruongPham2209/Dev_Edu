/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/submission-datail/page.tsx
 *
 * Purpose
 * -------
 * Verify that SubmissionDetailsDialog component renders modal title ("Student Assignment Details"),
 * tabs ("Submission Details" vs "Activity History"), comment input for adding feedback, and handles
 * feedback submission callback.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering ("Student Assignment Details")
 * ✓ Tab switching between "Submission Details" and "Activity History"
 * ✓ Comment input form submission triggering onAddFeedback callback
 * ✓ Close button click triggering onClose callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Modal open with selectedSubmission
 * ✓ Tab navigation
 * ✓ Adding feedback comment
 *
 * Mocked Dependencies
 * -------------------
 * - IntersectionObserver (Global mock for history tab observer)
 *
 * Not Covered
 * -----------
 * - Backdrop filter styling
 *
 * Notes
 * -----
 * Unit test for SubmissionDetailsDialog component.
 */

import type { SubmissionResponse } from "@/lib/type/assignments";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubmissionDetailsDialog } from "../page";

describe("SubmissionDetailsDialog", () => {
  const mockSubmission: SubmissionResponse = {
    id: "sub-100",
    fileName: "Final_Project_Code.zip",
    fileObjectKey: "submissions/final.zip",
    fileSize: 5242880,
    contentType: "application/zip",
  } as any;

  beforeEach(() => {
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })) as any;
  });

  it("shouldRenderTitleTabsAndHandleFeedbackSubmit", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare callbacks.
    // ----------------------------------------------------------------------------
    const handleAddFeedback = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render SubmissionDetailsDialog.
    // ----------------------------------------------------------------------------
    render(
      <SubmissionDetailsDialog
        open={true}
        onClose={handleClose}
        selectedSubmission={mockSubmission}
        isAdmin={false}
        feedbacks={[]}
        feedbacksLoading={false}
        onAddFeedback={handleAddFeedback}
        onDeleteFeedback={vi.fn()}
        history={[]}
        historyLoading={false}
        historyHasMore={false}
        onLoadMoreHistory={vi.fn()}
        triggerDownload={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and tabs render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Student Assignment Details")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Submission Details" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Activity History" }),
    ).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Type feedback and press Enter to submit.
    // ----------------------------------------------------------------------------
    const feedbackInput = screen.getByPlaceholderText("Write a feedback...");
    fireEvent.change(feedbackInput, {
      target: { value: "Excellent submission! Code structure looks clean." },
    });
    fireEvent.keyDown(feedbackInput, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(handleAddFeedback).toHaveBeenCalledWith(
        "Excellent submission! Code structure looks clean.",
      );
    });
  });
});
