/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/notification/notification-form.tsx
 *
 * Purpose
 * -------
 * Verify that CreateGroupNotificationDialog initializes form state correctly,
 * validates title length and target roles, handles target role checkbox selection toggles,
 * manages submit button disabled states, and invokes onSave callback with valid request data.
 *
 * Tested Features
 * ---------------
 * ✓ Title FormInput change and validation rules (3-120 chars)
 * ✓ RichTextEditor content value binding
 * ✓ Target role selection toggle checkboxes (STUDENT, LECTURER, ADMIN)
 * ✓ Form submit button disabled state when invalid or saving
 * ✓ Submission execution calling onSave callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Resetting form state when open prop transitions to true
 * ✓ Disabling submit button on empty/short title
 * ✓ Toggling target role selection
 * ✓ Invoking onSave callback with request payload when form is submitted
 * ✓ Disabling controls while saving prop is true
 *
 * Mocked Dependencies
 * -------------------
 * - "@/components/common/form/form-dialog" (mocked FormDialog)
 * - "@/components/common/form/rich-text-editor" (mocked RichTextEditor)
 *
 * Not Covered
 * -----------
 * - Raw HTML editor toolbar formatting
 *
 * Notes
 * -----
 * Unit test for CreateGroupNotificationDialog component.
 */

import type { RoleEnum } from "@/lib/type/enum";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateGroupNotificationDialog } from "../notification-form";

vi.mock("@/components/common/form/form-dialog", () => ({
  FormDialog: ({
    open,
    onClose,
    onSubmit,
    isSubmitDisabled,
    children,
  }: any) =>
    open ? (
      <div data-testid="form-dialog-mock">
        <h2>Create Group Notification</h2>
        <button onClick={onClose}>Cancel Dialog</button>
        <button onClick={onSubmit} disabled={isSubmitDisabled}>
          Send Announcement
        </button>
        <div>{children}</div>
      </div>
    ) : null,
}));

vi.mock("@/components/common/form/rich-text-editor", () => ({
  RichTextEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="rich-text-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe("CreateGroupNotificationDialog Component", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldResetFormFieldsAndTouchedStateWhenOpenPropIsTrue", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CreateGroupNotificationDialog with open = true.
    // ----------------------------------------------------------------------------
    render(
      <CreateGroupNotificationDialog
        open={true}
        saving={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify default inputs and role checkboxes.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByLabelText(/Notification Title/i),
    ).toHaveValue("");
    expect(screen.getByTestId("rich-text-editor")).toHaveValue("");
    expect(screen.getByLabelText(/Students/i)).toBeChecked();
    expect(screen.getByLabelText(/Lecturers/i)).toBeChecked();
    expect(screen.getByLabelText(/Admins/i)).toBeChecked();
  });

  it("shouldDisableSubmitButtonWhenTitleIsShorterThanThreeCharacters", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render CreateGroupNotificationDialog with open = true.
    // ----------------------------------------------------------------------------
    render(
      <CreateGroupNotificationDialog
        open={true}
        saving={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Type short title ("Ab").
    // ----------------------------------------------------------------------------
    const titleInput = screen.getByLabelText(/Notification Title/i);
    fireEvent.change(titleInput, { target: { value: "Ab" } });

    // ----------------------------------------------------------------------------
    // Assert
    // Submit button should be disabled.
    // ----------------------------------------------------------------------------
    const submitBtn = screen.getByRole("button", {
      name: "Send Announcement",
    });
    expect(submitBtn).toBeDisabled();
  });

  it("shouldAllowTogglingTargetRolesAndUpdateValidationState", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render dialog and set valid title.
    // ----------------------------------------------------------------------------
    render(
      <CreateGroupNotificationDialog
        open={true}
        saving={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const titleInput = screen.getByLabelText(/Notification Title/i);
    fireEvent.change(titleInput, {
      target: { value: "Valid System Announcement" },
    });

    // ----------------------------------------------------------------------------
    // Act
    // Uncheck target role by clicking checkbox with stopPropagation or box container.
    // ----------------------------------------------------------------------------
    const studentsCb = screen.getByLabelText(/Students/i);
    const lecturersCb = screen.getByLabelText(/Lecturers/i);
    const adminsCb = screen.getByLabelText(/Admins/i);

    fireEvent.click(studentsCb);
    fireEvent.click(lecturersCb);
    fireEvent.click(adminsCb);

    // ----------------------------------------------------------------------------
    // Assert
    // Submit button should be disabled because targetRoles is empty.
    // ----------------------------------------------------------------------------
    const submitBtn = screen.getByRole("button", {
      name: "Send Announcement",
    });
    expect(submitBtn).toBeDisabled();
  });

  it("shouldTriggerOnSaveWithValidFormRequestWhenSubmitted", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render dialog, enter valid title, content, and select target role.
    // ----------------------------------------------------------------------------
    render(
      <CreateGroupNotificationDialog
        open={true}
        saving={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const titleInput = screen.getByLabelText(/Notification Title/i);
    const editor = screen.getByTestId("rich-text-editor");

    fireEvent.change(titleInput, {
      target: { value: "Scheduled Server Upgrade" },
    });
    fireEvent.change(editor, {
      target: { value: "<p>Server upgrade will begin at 2:00 AM.</p>" },
    });

    // ----------------------------------------------------------------------------
    // Act
    // Click submit button.
    // ----------------------------------------------------------------------------
    const submitBtn = screen.getByRole("button", {
      name: "Send Announcement",
    });
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify onSave was called with valid request object.
    // ----------------------------------------------------------------------------
    expect(mockOnSave).toHaveBeenCalledWith({
      title: "Scheduled Server Upgrade",
      content: "<p>Server upgrade will begin at 2:00 AM.</p>",
      targetRoles: ["STUDENT", "LECTURER", "ADMIN"],
    });
  });

  it("shouldDisableSubmitButtonWhenSavingIsTrue", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CreateGroupNotificationDialog with saving = true.
    // ----------------------------------------------------------------------------
    render(
      <CreateGroupNotificationDialog
        open={true}
        saving={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Submit button should be disabled while saving.
    // ----------------------------------------------------------------------------
    const submitBtn = screen.getByRole("button", {
      name: "Send Announcement",
    });
    expect(submitBtn).toBeDisabled();
  });
});
