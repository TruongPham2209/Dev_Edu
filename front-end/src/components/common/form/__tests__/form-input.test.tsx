/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/form/form-input.tsx
 *
 * Purpose
 * -------
 * Verify that FormInput component renders label, input/textarea element, start/end icons,
 * error state & helperText, character count ratio, and handles user typing events.
 *
 * Tested Features
 * ---------------
 * ✓ Input rendering with label and placeholder
 * ✓ Multiline textarea rendering when multiline is true
 * ✓ Icon rendering (start vs end position) and icon click handler
 * ✓ Error state and helperText message display
 * ✓ Character count ratio display ({characterCount}/{maxLength})
 *
 * Covered Scenarios
 * -----------------
 * ✓ Standard single-line input with start icon
 * ✓ Multiline textarea input with helperText error message
 * ✓ Icon click event execution
 * ✓ Character count rendering
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - Focus glow animation
 *
 * Notes
 * -----
 * Unit test for FormInput component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormInput } from "../form-input";

describe("FormInput", () => {
  it("shouldRenderLabelPlaceholderAndHandleTyping", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare onChange handler.
    // ----------------------------------------------------------------------------
    const handleChange = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render FormInput.
    // ----------------------------------------------------------------------------
    render(
      <FormInput
        label="Username"
        placeholder="Enter your username"
        value=""
        onChange={handleChange}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify label and input exist in DOM.
    // ----------------------------------------------------------------------------
    expect(screen.getByLabelText("Username")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Enter your username");
    expect(input).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Type into input and verify onChange handler.
    // ----------------------------------------------------------------------------
    fireEvent.change(input, { target: { value: "john_doe" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("shouldRenderMultilineTextareaWhenMultilineIsTrue", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render multiline input.
    // ----------------------------------------------------------------------------
    render(
      <FormInput
        label="Bio"
        multiline={true}
        minRows={3}
        placeholder="Tell us about yourself"
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify rendered element is a textarea.
    // ----------------------------------------------------------------------------
    const textarea = screen.getByPlaceholderText("Tell us about yourself");
    expect(textarea.tagName.toLowerCase()).toBe("textarea");
  });

  it("shouldRenderErrorHelperTextAndCharacterCount", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render input in error state with helperText and character counter.
    // ----------------------------------------------------------------------------
    render(
      <FormInput
        label="Course Title"
        error={true}
        helperText="Title is required and must be at least 3 characters."
        characterCount={15}
        maxLength={50}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error text and character count ratio render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Title is required and must be at least 3 characters."),
    ).toBeInTheDocument();
    expect(screen.getByText("15/50")).toBeInTheDocument();
  });

  it("shouldRenderIconAndTriggerOnIconClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare icon click handler.
    // ----------------------------------------------------------------------------
    const handleIconClick = vi.fn();

    render(
      <FormInput
        label="Search"
        icon={<span data-testid="search-icon">SearchIcon</span>}
        iconPosition="start"
        onIconClick={handleIconClick}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Click icon button.
    // ----------------------------------------------------------------------------
    const iconBtn = screen.getByRole("button");
    fireEvent.click(iconBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onIconClick was invoked.
    // ----------------------------------------------------------------------------
    expect(handleIconClick).toHaveBeenCalledTimes(1);
  });
});
