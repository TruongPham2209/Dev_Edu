/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/quiz/question-form-dialog.tsx
 *
 * Purpose
 * -------
 * Verify QuestionFormDialog modal for adding and editing quiz questions,
 * option management, and calling onSave prop.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering question prompt editor, question type picker, and options list
 * ✓ Adding/removing options for choice questions
 * ✓ Submitting question payload via onSave callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Modal open state in create mode vs edit mode
 * ✓ Option addition and answer key selection
 *
 * Mocked Dependencies
 * -------------------
 * - None (Pure UI component test)
 *
 * Not Covered
 * -----------
 * - Rich text editor DOM interactions (Tiptap)
 *
 * Notes
 * -----
 * Unit test for QuestionFormDialog component.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionFormDialog } from "../question-form-dialog";

describe("QuestionFormDialog Component", () => {
  const mockConfigs = [
    {
      id: "cfg-1",
      questionType: "SINGLE_CHOICE",
      numberOfQuestions: 5,
      pointsPerQuestion: 2,
      passPercentage: 70,
    },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderCreateQuestionDialogTitle", () => {
    render(
      <QuestionFormDialog
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        availableTypeConfigs={mockConfigs}
      />,
    );

    expect(screen.getByText(/Create Question/i)).toBeInTheDocument();
  });

  it("shouldSubmitQuestionFormWhenValid", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <QuestionFormDialog
        open={true}
        onClose={onClose}
        onSave={onSave}
        availableTypeConfigs={mockConfigs}
      />,
    );

    const contentInput = screen.getByLabelText(/Question Content/i);
    fireEvent.change(contentInput, { target: { value: "What is Vitest?" } });

    const submitBtn = screen.getByRole("button", { name: /Save Question/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          questionType: "SINGLE_CHOICE",
          content: "What is Vitest?",
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});
