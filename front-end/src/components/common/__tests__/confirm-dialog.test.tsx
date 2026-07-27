/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/confirm-dialog.tsx
 *
 * Purpose
 * -------
 * Verify that ConfirmDialog component renders title, description, custom button
 * labels, and properly invokes onConfirm and onCancel callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ Conditional rendering based on open prop
 * ✓ Title and optional description display
 * ✓ Default and custom confirm/cancel button labels
 * ✓ Click handler execution for confirm and cancel actions
 *
 * Covered Scenarios
 * -----------------
 * ✓ Open dialog with default labels
 * ✓ Open dialog with custom labels and description
 * ✓ Closed dialog (not rendered in DOM)
 * ✓ User clicking confirm button
 * ✓ User clicking cancel button
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI Dialog via RTL)
 *
 * Not Covered
 * -----------
 * - MUI backdrop animation transitions
 *
 * Notes
 * -----
 * Unit test for React UI component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "../confirm-dialog";

describe("ConfirmDialog", () => {
  it("shouldNotRenderContentWhenOpenIsFalse", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render closed dialog.
    // ----------------------------------------------------------------------------
    render(
      <ConfirmDialog
        open={false}
        title="Delete Item"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title is not in document.
    // ----------------------------------------------------------------------------
    expect(screen.queryByText("Delete Item")).not.toBeInTheDocument();
  });

  it("shouldRenderTitleDescriptionAndDefaultButtonLabelsWhenOpenIsTrue", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render open dialog with description.
    // ----------------------------------------------------------------------------
    render(
      <ConfirmDialog
        open={true}
        title="Delete Item"
        description="Are you sure you want to delete this course?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, description, and default labels.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this course?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("shouldRenderCustomButtonLabelsWhenProvided", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render dialog with custom labels.
    // ----------------------------------------------------------------------------
    render(
      <ConfirmDialog
        open={true}
        title="Archive Course"
        confirmLabel="Yes, Archive"
        cancelLabel="No, Keep"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify custom labels exist.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("button", { name: "Yes, Archive" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "No, Keep" }),
    ).toBeInTheDocument();
  });

  it("shouldCallOnConfirmWhenConfirmButtonIsClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare click handlers and render component.
    // ----------------------------------------------------------------------------
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Action"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Click confirm button.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onConfirm was invoked and onCancel was not.
    // ----------------------------------------------------------------------------
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it("shouldCallOnCancelWhenCancelButtonIsClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare click handlers and render component.
    // ----------------------------------------------------------------------------
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Action"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Click cancel button.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onCancel was invoked.
    // ----------------------------------------------------------------------------
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
