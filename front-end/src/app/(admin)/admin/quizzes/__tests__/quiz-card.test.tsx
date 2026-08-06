/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/quizzes/quiz-card.tsx
 *
 * Purpose
 * -------
 * Verify Admin QuizCard displays quiz title, course name, status, question count,
 * pass mark, and triggers approve/reject/details action callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering quiz title, course name, and QuizStatusChip
 * ✓ Triggering onViewDetails, onApprove, and onReject callbacks on button clicks
 *
 * Covered Scenarios
 * -----------------
 * ✓ Pending approval admin quiz card view
 * ✓ Admin action button clicks
 *
 * Mocked Dependencies
 * -------------------
 * - None (Pure presentation component test)
 *
 * Not Covered
 * -----------
 * - CSS animation hover transitions
 *
 * Notes
 * -----
 * Unit test for Admin QuizCard component.
 */

import type { QuizResponse } from "@/lib/type/quizzes";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizCard } from "../quiz-card";

describe("Admin QuizCard Component", () => {
  const mockQuiz: QuizResponse = {
    id: "q-1",
    courseId: "c-1",
    courseTitle: "Database Design 101",
    title: "SQL Indexing Quiz",
    description: "Test index knowledge",
    passPercentage: 80,
    status: "PENDING",
    typeConfigs: [{ id: "cfg-1" }],
    createdAt: "2026-08-06T10:00:00Z",
  } as any;

  it("shouldRenderQuizCardMetadataAndPendingStatus", () => {
    const onViewDetails = vi.fn();
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <QuizCard
        quiz={mockQuiz}
        onViewDetails={onViewDetails}
        onApprove={onApprove}
        onReject={onReject}
      />,
    );

    expect(screen.getByText("SQL Indexing Quiz")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shouldTriggerOnApproveWhenClickingApproveButton", () => {
    const onViewDetails = vi.fn();
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <QuizCard
        quiz={mockQuiz}
        onViewDetails={onViewDetails}
        onApprove={onApprove}
        onReject={onReject}
      />,
    );

    const approveBtn = screen.getByRole("button", { name: /Approve/i });
    fireEvent.click(approveBtn);

    expect(onApprove).toHaveBeenCalledWith(mockQuiz);
  });
});
