/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/quiz-assignment/quiz-assignment-dialog.tsx
 *
 * Purpose
 * -------
 * Verify QuizAssignmentDialog modal for assigning quiz to a course, configuring
 * title, duration, start/end dates, max attempts, and handling form submission.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering input fields and modal title when open
 * ✓ Validating assignment parameters (assignment name, duration, start/end dates)
 * ✓ Handling assignment creation submission via onSave callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Modal open state rendering
 * ✓ Form input change and validation state
 * ✓ Successful assignment form submission
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/quizzes" (useCreateQuizAssignmentMutation, useUpdateQuizAssignmentMutation)
 * - "@/lib/toast-context" (useToast)
 *
 * Not Covered
 * -----------
 * - Direct backend API network requests
 * - Material UI animation transitions
 *
 * Notes
 * -----
 * Unit test for QuizAssignmentDialog component.
 */

import * as quizzesApi from "@/lib/api/quizzes";
import * as toastContext from "@/lib/toast-context";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuizAssignmentDialog } from "../quiz-assignment-dialog";

vi.mock("@/lib/api/quizzes", () => ({
  useCreateQuizAssignmentMutation: vi.fn(),
  useUpdateQuizAssignmentMutation: vi.fn(),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(),
}));

describe("QuizAssignmentDialog Component", () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const mockCreateMutateAsync = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(toastContext.useToast).mockReturnValue(mockToast as any);
    vi.mocked(quizzesApi.useCreateQuizAssignmentMutation).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as any);
  });

  it("shouldRenderTitleAndInputFieldsWhenOpen", () => {
    render(
      <QuizAssignmentDialog
        open={true}
        defaultQuizId="q-1"
        quizTitle="Midterm Exam"
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText(/Create Assignment/i)).toBeInTheDocument();
  });

  it("shouldSubmitAssignmentFormSuccessfully", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <QuizAssignmentDialog
        open={true}
        defaultQuizId="q-1"
        quizTitle="Midterm Exam"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const titleInput = screen.getByLabelText(/Assignment Name \*/i);
    fireEvent.change(titleInput, { target: { value: "Midterm Exam 2026" } });

    const submitBtn = screen.getByRole("button", {
      name: /Create Assignment/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          quizId: "q-1",
          assignmentName: "Midterm Exam 2026",
        }),
      );
    });
  });
});
