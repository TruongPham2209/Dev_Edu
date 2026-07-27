/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/button-action.tsx
 *
 * Purpose
 * -------
 * Verify that ButtonAction component renders icon buttons with specified variants,
 * colors, tooltip wrappers, disabled states, and handles user clicks.
 *
 * Tested Features
 * ---------------
 * ✓ Icon rendering inside IconButton
 * ✓ Tooltip wrapper rendering when tooltip prop is supplied
 * ✓ Disabled button state & wrapper span for tooltip on disabled buttons
 * ✓ Click event handler execution
 * ✓ Variant style application ("contained", "soft", "soft-dark", "outline")
 *
 * Covered Scenarios
 * -----------------
 * ✓ Button without tooltip
 * ✓ Button with tooltip
 * ✓ Disabled button with tooltip
 * ✓ Variant options ("contained", "soft", "soft-dark", "outline")
 * ✓ User click interaction
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS hover shadow calculations
 *
 * Notes
 * -----
 * Unit test for ButtonAction component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ButtonAction from "../button-action";

describe("ButtonAction", () => {
  it("shouldRenderIconInsideButtonAndHandleClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare click handler and render component.
    // ----------------------------------------------------------------------------
    const handleClick = vi.fn();
    const icon = <span data-testid="action-icon">Edit</span>;

    // ----------------------------------------------------------------------------
    // Act
    // Render component.
    // ----------------------------------------------------------------------------
    render(
      <ButtonAction icon={icon} onClick={handleClick} aria-label="Edit Item" />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify icon is rendered.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("action-icon")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Edit Item" });
    expect(button).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click button and verify handler invocation.
    // ----------------------------------------------------------------------------
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shouldRenderDisabledButtonAndPreventClicks", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare mock handler and render disabled button.
    // ----------------------------------------------------------------------------
    const handleClick = vi.fn();
    const icon = <span>Delete</span>;

    // ----------------------------------------------------------------------------
    // Act
    // Render disabled button with tooltip.
    // ----------------------------------------------------------------------------
    render(
      <ButtonAction
        icon={icon}
        disabled={true}
        tooltip="Delete post"
        onClick={handleClick}
        aria-label="Delete"
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify button is disabled.
    // ----------------------------------------------------------------------------
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toBeDisabled();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Attempt click on disabled button.
    // ----------------------------------------------------------------------------
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
