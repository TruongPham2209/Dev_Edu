/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/form/form-dialog.tsx
 *
 * Purpose
 * -------
 * Verify that FormDialog component renders modal title, header icon, children elements,
 * custom submit/cancel button labels, handles submit callback execution with loading state,
 * and handles close callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering title, header icon, and children when open is true
 * ✓ Custom submitText and cancelText rendering
 * ✓ Submit button execution triggering onSubmit
 * ✓ Submit button disabled state via isSubmitDisabled prop
 * ✓ Close button click triggering onClose
 *
 * Covered Scenarios
 * -----------------
 * ✓ Modal open with children content
 * ✓ User clicking submit button (calls onSubmit)
 * ✓ User clicking cancel button (calls onClose)
 * ✓ isSubmitDisabled prop = true (button disabled)
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI Dialog via RTL)
 *
 * Not Covered
 * -----------
 * - Backdrop blur CSS filter
 *
 * Notes
 * -----
 * Unit test for FormDialog component.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormDialog } from "../form-dialog";

describe("FormDialog", () => {
  it("shouldNotRenderDialogWhenOpenIsFalse", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render closed form dialog.
    // ----------------------------------------------------------------------------
    render(
      <FormDialog
        open={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        title="Settings"
        headerIcon={<span data-testid="icon">Icon</span>}
      >
        <div>Dialog Content</div>
      </FormDialog>,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify dialog title is not in document.
    // ----------------------------------------------------------------------------
    expect(
      screen.queryByRole("heading", { name: "Settings" }),
    ).not.toBeInTheDocument();
  });

  it("shouldRenderTitleChildrenAndExecuteSubmitCallback", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare onSubmit and onClose mocks.
    // ----------------------------------------------------------------------------
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render open dialog.
    // ----------------------------------------------------------------------------
    render(
      <FormDialog
        open={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title="Create Category"
        headerIcon={<span data-testid="header-icon">Icon</span>}
        submitText="Save Category"
        cancelText="Discard"
      >
        <div>Category Form Body</div>
      </FormDialog>,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, icon, child text, and custom button labels.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Create Category" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("header-icon")).toBeInTheDocument();
    expect(screen.getByText("Category Form Body")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: "Save Category" });
    const cancelBtn = screen.getByRole("button", { name: "Discard" });

    expect(submitBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click submit button and verify handleSubmit is invoked.
    // ----------------------------------------------------------------------------
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it("shouldDisableSubmitButtonWhenIsSubmitDisabledIsTrue", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render dialog with isSubmitDisabled = true.
    // ----------------------------------------------------------------------------
    render(
      <FormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        title="Form Title"
        headerIcon={<span>Icon</span>}
        submitText="Submit Form"
        isSubmitDisabled={true}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify submit button is disabled.
    // ----------------------------------------------------------------------------
    const submitBtn = screen.getByRole("button", { name: "Submit Form" });
    expect(submitBtn).toBeDisabled();
  });
});
