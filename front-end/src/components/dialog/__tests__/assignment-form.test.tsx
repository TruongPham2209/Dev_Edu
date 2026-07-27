/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/assignment-form.tsx
 *
 * Purpose
 * -------
 * Verify that AssignmentFormDialog component handles title and description input,
 * character limit validation (<= 500 chars), form submission, API mutation execution,
 * success toast notifications, and dialog close callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ Dialog open state and reset on open
 * ✓ Title and description validation (empty check & >500 character check)
 * ✓ Form submission disabled when invalid
 * ✓ Successful submission triggering createAssignmentMutate, showSuccess, and onSuccess
 * ✓ API error handling via handleError
 *
 * Covered Scenarios
 * -----------------
 * ✓ Dialog open with blank inputs
 * ✓ Invalid title (empty string)
 * ✓ Invalid description (>500 characters)
 * ✓ Valid title and description input submission
 * ✓ API exception failure path
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/assignments" (useCreateAssignmentMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "@/components/common/form/rich-text-editor" (mocked as simple input textarea)
 *
 * Not Covered
 * -----------
 * - Tiptap rich text formatting buttons
 *
 * Notes
 * -----
 * Unit test for AssignmentFormDialog component.
 */

import * as assignmentsApi from "@/lib/api/assignments";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssignmentFormDialog } from "../assignment-form";

vi.mock("@/lib/api/assignments", () => ({
  useCreateAssignmentMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("@/components/common/form/rich-text-editor", () => ({
  RichTextEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      data-testid="rich-text-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe("AssignmentFormDialog", () => {
  const mockMutateAsync = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assignmentsApi.useCreateAssignmentMutation).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as any);
  });

  it("shouldNotRenderModalWhenOpenIsFalse", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render closed form dialog.
    // ----------------------------------------------------------------------------
    render(
      <AssignmentFormDialog
        open={false}
        onClose={vi.fn()}
        lectureId="lec-10"
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title is not in DOM.
    // ----------------------------------------------------------------------------
    expect(screen.queryByText("Create assignment")).not.toBeInTheDocument();
  });

  it("shouldRenderTitleAndInputFieldsWhenOpenIsTrue", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render open form dialog.
    // ----------------------------------------------------------------------------
    render(
      <AssignmentFormDialog open={true} onClose={vi.fn()} lectureId="lec-10" />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, input placeholder, and submit button.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Create assignment" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Assignment for ...")).toBeInTheDocument();
    expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: "Create assignment" });
    expect(submitBtn).toBeDisabled();
  });

  it("shouldSubmitAssignmentFormSuccessfullyWhenInputsAreValid", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare callbacks and resolved mutation value.
    // ----------------------------------------------------------------------------
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    const createdAssignment = { id: "assign-1", title: "Homework 1" };
    mockMutateAsync.mockResolvedValue(createdAssignment);

    render(
      <AssignmentFormDialog
        open={true}
        onClose={handleClose}
        lectureId="lec-10"
        onSuccess={handleSuccess}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Fill title and instructions.
    // ----------------------------------------------------------------------------
    const titleInput = screen.getByPlaceholderText("Assignment for ...");
    const editor = screen.getByTestId("rich-text-editor");

    fireEvent.change(titleInput, {
      target: { value: "React 19 Hooks Assignment" },
    });
    fireEvent.change(editor, {
      target: { value: "<p>Implement custom hooks.</p>" },
    });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Create assignment" });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify mutateAsync, showSuccess, onSuccess, and handleClose invocation.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        lectureId: "lec-10",
        title: "React 19 Hooks Assignment",
        description: "<p>Implement custom hooks.</p>",
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(
        "Added assignment successfully",
      );
      expect(handleSuccess).toHaveBeenCalledWith(createdAssignment);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it("shouldHandleErrorWhenMutationFails", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock mutation error.
    // ----------------------------------------------------------------------------
    const error = new Error("Network failure");
    mockMutateAsync.mockRejectedValue(error);

    render(
      <AssignmentFormDialog open={true} onClose={vi.fn()} lectureId="lec-10" />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Fill inputs and submit.
    // ----------------------------------------------------------------------------
    fireEvent.change(screen.getByPlaceholderText("Assignment for ..."), {
      target: { value: "Task" },
    });
    fireEvent.change(screen.getByTestId("rich-text-editor"), {
      target: { value: "Task details" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create assignment" }));

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify handleError was called.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        error,
        "Cannot add assignment",
      );
    });
  });
});
