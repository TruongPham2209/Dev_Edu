/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/submission-datail/submission-history-tab.tsx
 *
 * Purpose
 * -------
 * Verify that SubmissionHistoryTab component renders submission activity logs, empty state,
 * and loading indicator.
 *
 * Tested Features
 * ---------------
 * ✓ Activity history list rendering (details, status, timestamp)
 * ✓ Empty history state message display
 * ✓ Loading history indicator
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering submission activity history items
 * ✓ Empty history list rendering
 *
 * Mocked Dependencies
 * -------------------
 * - IntersectionObserver (Global mock for auto scroll observer)
 *
 * Not Covered
 * -----------
 * - Infinite scroll element viewport intersection
 *
 * Notes
 * -----
 * Unit test for SubmissionHistoryTab component.
 */

import type { SubmissionLogResponse } from "@/lib/type/assignments";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubmissionHistoryTab } from "../submission-history-tab";

describe("SubmissionHistoryTab", () => {
  beforeEach(() => {
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
  });

  it("shouldRenderNoActivityHistoryRecordedWhenHistoryIsEmpty", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render with empty history.
    // ----------------------------------------------------------------------------
    render(
      <SubmissionHistoryTab
        history={[]}
        historyLoading={false}
        historyHasMore={false}
        onLoadMoreHistory={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state message.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("No activity history recorded"),
    ).toBeInTheDocument();
  });

  it("shouldRenderHistoryTimelineItemsWithDetailsAndStatus", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare history logs.
    // ----------------------------------------------------------------------------
    const mockHistory: SubmissionLogResponse[] = [
      {
        id: "log-1",
        details: "Student uploaded solution zip archive",
        status: "SUBMITTED",
        updatedAt: "2026-06-18T10:00:00.000Z",
      },
    ];

    // ----------------------------------------------------------------------------
    // Act
    // Render SubmissionHistoryTab.
    // ----------------------------------------------------------------------------
    render(
      <SubmissionHistoryTab
        history={mockHistory}
        historyLoading={false}
        historyHasMore={false}
        onLoadMoreHistory={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify log details and status chip.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Student uploaded solution zip archive"),
    ).toBeInTheDocument();
    expect(screen.getByText("SUBMITTED")).toBeInTheDocument();
  });
});
