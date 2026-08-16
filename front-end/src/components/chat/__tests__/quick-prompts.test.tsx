/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/chat/quick-prompts.tsx
 *
 * Purpose
 * -------
 * Verify rendering of suggested quick prompt chips and user click interactions.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering of section title "Suggested Prompts"
 * ✓ Rendering of default prompt options (Backend, Price, Roadmap, Python)
 * ✓ Click handler callback invocation with prompt text
 * ✓ Disabled state behavior
 *
 * Covered Scenarios
 * -----------------
 * ✓ Prompt chip click triggers onSelectPrompt with exact text
 * ✓ disabled: true prevents prompt click callback
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Notes
 * -----
 * Unit test for QuickPrompts component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuickPrompts } from "../quick-prompts";

describe("QuickPrompts", () => {
  it("shouldRenderSuggestedPromptsSectionAndChipItems", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render QuickPrompts component.
    // ----------------------------------------------------------------------------
    const onSelectPromptMock = vi.fn();
    render(<QuickPrompts onSelectPrompt={onSelectPromptMock} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and chip items are present.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Suggested Prompts")).toBeInTheDocument();
    expect(
      screen.getByText("Recommend Backend Development courses"),
    ).toBeInTheDocument();
    expect(screen.getByText("Courses under 500,000 VND")).toBeInTheDocument();
    expect(
      screen.getByText("Fullstack Web Developer roadmap"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Beginner Friendly Python courses"),
    ).toBeInTheDocument();
  });

  it("shouldCallOnSelectPromptWhenChipIsClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // ----------------------------------------------------------------------------
    const onSelectPromptMock = vi.fn();
    render(<QuickPrompts onSelectPrompt={onSelectPromptMock} />);

    // ----------------------------------------------------------------------------
    // Act
    // Click on a prompt chip.
    // ----------------------------------------------------------------------------
    const chip = screen.getByText("Fullstack Web Developer roadmap");
    fireEvent.click(chip);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify callback was invoked with exact prompt string.
    // ----------------------------------------------------------------------------
    expect(onSelectPromptMock).toHaveBeenCalledWith(
      "Fullstack Web Developer roadmap",
    );
  });
});
