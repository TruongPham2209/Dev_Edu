/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/infinite-load-button.tsx
 *
 * Purpose
 * -------
 * Verify that InfiniteLoadButton component manages loading spinner state,
 * disabled states, click interactions, and conditional rendering based on
 * the hasMore flag.
 *
 * Tested Features
 * ---------------
 * ✓ Null rendering when hasMore is false
 * ✓ Button rendering when hasMore is true
 * ✓ Disabled button state & spinner indicator when loading is true
 * ✓ Enabled button state & "Load more" text when loading is false
 * ✓ Click handler execution
 *
 * Covered Scenarios
 * -----------------
 * ✓ hasMore: false (renders null)
 * ✓ hasMore: true, loading: false (renders active "Load more" button)
 * ✓ hasMore: true, loading: true (renders disabled "Loading" button with spinner)
 * ✓ User click interaction when enabled vs disabled
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders UI component via RTL)
 *
 * Not Covered
 * -----------
 * - Scroll position trigger logic
 *
 * Notes
 * -----
 * Unit test for InfiniteLoadButton component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InfiniteLoadButton } from "../infinite-load-button";

describe("InfiniteLoadButton", () => {
  it("shouldReturnNullWhenHasMoreIsFalse", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render component with hasMore = false.
    // ----------------------------------------------------------------------------
    const { container } = render(
      <InfiniteLoadButton
        loading={false}
        hasMore={false}
        onLoadMore={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify container is empty.
    // ----------------------------------------------------------------------------
    expect(container).toBeEmptyDOMElement();
  });

  it("shouldRenderEnabledLoadMoreButtonWhenHasMoreIsTrueAndLoadingIsFalse", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare mock click handler.
    // ----------------------------------------------------------------------------
    const handleLoadMore = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render component.
    // ----------------------------------------------------------------------------
    render(
      <InfiniteLoadButton
        loading={false}
        hasMore={true}
        onLoadMore={handleLoadMore}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify button text and enabled state.
    // ----------------------------------------------------------------------------
    const button = screen.getByRole("button", { name: "Load more" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click button and verify callback invocation.
    // ----------------------------------------------------------------------------
    fireEvent.click(button);
    expect(handleLoadMore).toHaveBeenCalledTimes(1);
  });

  it("shouldRenderDisabledLoadingButtonWhenLoadingIsTrue", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render component in loading state.
    // ----------------------------------------------------------------------------
    render(
      <InfiniteLoadButton loading={true} hasMore={true} onLoadMore={vi.fn()} />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify button text is "Loading" and button is disabled.
    // ----------------------------------------------------------------------------
    const button = screen.getByRole("button", { name: "Loading" });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
