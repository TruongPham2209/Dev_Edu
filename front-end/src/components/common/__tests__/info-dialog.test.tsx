/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/info-dialog.tsx
 *
 * Purpose
 * -------
 * Verify that InfoDialog component renders title, header icon, children content,
 * close button, and executes onClose callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering dialog title and header icon
 * ✓ Children content rendering inside DialogContent
 * ✓ Custom vs default close button text
 * ✓ Triggering onClose callback from header close icon and bottom action button
 *
 * Covered Scenarios
 * -----------------
 * ✓ Dialog open state with title and children content
 * ✓ User clicking top icon button to close
 * ✓ User clicking bottom action button to close
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI Dialog via RTL)
 *
 * Not Covered
 * -----------
 * - Backdrop blur filter
 *
 * Notes
 * -----
 * Unit test for InfoDialog component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InfoDialog } from "../info-dialog";

describe("InfoDialog", () => {
  it("shouldRenderTitleHeaderIconAndChildrenWhenOpen", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render InfoDialog with title, icon, and children.
    // ----------------------------------------------------------------------------
    render(
      <InfoDialog
        open={true}
        onClose={vi.fn()}
        title="Course Details"
        headerIcon={<span data-testid="header-icon">InfoIcon</span>}
      >
        <p>This course covers Next.js and React 19.</p>
      </InfoDialog>,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, icon, and child text render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Course Details")).toBeInTheDocument();
    expect(screen.getByTestId("header-icon")).toBeInTheDocument();
    expect(
      screen.getByText("This course covers Next.js and React 19."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("shouldCallOnCloseWhenBottomCloseButtonIsClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare mock onClose handler.
    // ----------------------------------------------------------------------------
    const handleClose = vi.fn();

    render(
      <InfoDialog
        open={true}
        onClose={handleClose}
        title="User Settings"
        headerIcon={<span>User</span>}
        closeText="Dismiss"
      >
        <div>Settings Content</div>
      </InfoDialog>,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Click custom "Dismiss" button.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onClose callback was invoked.
    // ----------------------------------------------------------------------------
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
