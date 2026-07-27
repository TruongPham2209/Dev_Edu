/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/error-state.tsx
 *
 * Purpose
 * -------
 * Verify that ErrorState component displays error title, optional subtitle,
 * and retry button when onRetry callback is provided.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering with error severity styling
 * ✓ Subtitle conditional rendering
 * ✓ Retry button display with default ("Retry") or custom label
 * ✓ Retry button click handler execution
 *
 * Covered Scenarios
 * -----------------
 * ✓ Title only without retry action
 * ✓ Title, subtitle, custom actionLabel, and onRetry handler
 * ✓ Retry button click interaction
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders UI component via RTL)
 *
 * Not Covered
 * -----------
 * - CSS animation styles
 *
 * Notes
 * -----
 * Unit test for ErrorState component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "../error-state";

describe("ErrorState", () => {
  it("shouldRenderTitleWithoutButtonWhenOnRetryIsNotProvided", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render component without onRetry prop.
    // ----------------------------------------------------------------------------
    render(<ErrorState title="Failed to load data" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title is rendered and button is absent.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Failed to load data")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shouldRenderSubtitleAndDefaultRetryButtonWhenOnRetryIsProvided", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare mock retry handler.
    // ----------------------------------------------------------------------------
    const handleRetry = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render component with onRetry and subtitle.
    // ----------------------------------------------------------------------------
    render(
      <ErrorState
        title="Server Error"
        subtitle="Could not connect to backend service."
        onRetry={handleRetry}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, subtitle, and default "Retry" button render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Server Error")).toBeInTheDocument();
    expect(
      screen.getByText("Could not connect to backend service."),
    ).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "Retry" });
    expect(retryButton).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click retry button and verify callback invocation.
    // ----------------------------------------------------------------------------
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("shouldRenderCustomActionLabelWhenProvided", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render component with custom action label.
    // ----------------------------------------------------------------------------
    render(
      <ErrorState
        title="Network Error"
        onRetry={vi.fn()}
        actionLabel="Try Again"
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify custom button label is rendered.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("button", { name: "Try Again" }),
    ).toBeInTheDocument();
  });
});
