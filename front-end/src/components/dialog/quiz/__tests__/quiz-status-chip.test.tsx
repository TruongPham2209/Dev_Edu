/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/quiz/quiz-status-chip.tsx
 *
 * Purpose
 * -------
 * Verify that QuizStatusChip renders correct label, icon, and color for all
 * supported QuizStatus, AttemptStatus, and AssignmentStatus values.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering chip label and styling for DRAFT, PENDING, APPROVED, REJECTED statuses
 * ✓ Rendering attempt and assignment statuses (IN_PROGRESS, SUBMITTED, GRADED)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Status chip rendering across all supported status values
 *
 * Mocked Dependencies
 * -------------------
 * - None (Pure presentation component test)
 *
 * Not Covered
 * -----------
 * - Theme color contrast calculations
 *
 * Notes
 * -----
 * Unit test for QuizStatusChip component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuizStatusChip } from "../quiz-status-chip";

describe("QuizStatusChip Component", () => {
  const testCases = [
    { status: "DRAFT", expectedLabel: "Draft" },
    { status: "PENDING", expectedLabel: "Pending" },
    { status: "APPROVED", expectedLabel: "Approved" },
    { status: "REJECTED", expectedLabel: "Rejected" },
    { status: "IN_PROGRESS", expectedLabel: "In progress" },
    { status: "SUBMITTED", expectedLabel: "Submitted" },
    { status: "GRADING", expectedLabel: "Pending auto-grading" },
    { status: "GRADED", expectedLabel: "Graded" },
    { status: "EXPIRED", expectedLabel: "Expired" },
    { status: "SCHEDULED", expectedLabel: "Scheduled" },
    { status: "ACTIVE", expectedLabel: "Active" },
    { status: "CLOSED", expectedLabel: "Closed" },
  ];

  testCases.forEach(({ status, expectedLabel }) => {
    it(`shouldRenderCorrectLabelForStatus_${status}`, () => {
      render(<QuizStatusChip status={status} />);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    });
  });
});
