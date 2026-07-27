/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/empty-state.tsx
 *
 * Purpose
 * -------
 * Verify that EmptyState component displays title, optional subtitle, icon,
 * action button, and correctly handles action button clicks.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering title text
 * ✓ Conditional subtitle rendering
 * ✓ Custom icon vs default Inbox icon rendering
 * ✓ Action button rendering when actionLabel and onAction are provided
 * ✓ Action button callback execution
 *
 * Covered Scenarios
 * -----------------
 * ✓ Minimal props (title only)
 * ✓ Full props (title, subtitle, custom icon, actionLabel, onAction)
 * ✓ Action button user click interaction
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders UI component via RTL)
 *
 * Not Covered
 * -----------
 * - Theme styling rules
 *
 * Notes
 * -----
 * Unit test for EmptyState component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("shouldRenderTitleAndDefaultIconWhenMinimalPropsProvided", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render component with minimal props.
    // ----------------------------------------------------------------------------
    render(<EmptyState title="No courses found" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title is rendered and no action button exists.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No courses found")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shouldRenderSubtitleCustomIconAndActionButtonWhenAllPropsProvided", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare action handler and props.
    // ----------------------------------------------------------------------------
    const handleAction = vi.fn();
    const customIcon = <span data-testid="custom-icon">Icon</span>;

    // ----------------------------------------------------------------------------
    // Act
    // Render component with all props.
    // ----------------------------------------------------------------------------
    render(
      <EmptyState
        title="No Assignments"
        subtitle="Create your first assignment to get started."
        icon={customIcon}
        actionLabel="Create Assignment"
        onAction={handleAction}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, subtitle, custom icon, and button render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No Assignments")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first assignment to get started."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();

    const actionBtn = screen.getByRole("button", { name: "Create Assignment" });
    expect(actionBtn).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click button and verify callback invocation.
    // ----------------------------------------------------------------------------
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
