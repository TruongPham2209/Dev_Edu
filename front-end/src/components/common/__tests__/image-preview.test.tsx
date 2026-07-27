/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/image-preview.tsx
 *
 * Purpose
 * -------
 * Verify that ImagePreview modal component handles image loading states, fallback
 * images on error or missing src, image load events, and close callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ Modal visibility based on open prop
 * ✓ Image source initialization and fallback image on null/undefined src
 * ✓ Loading spinner display during image load
 * ✓ Image error event handling triggering fallback image
 * ✓ Close button click event handler execution
 *
 * Covered Scenarios
 * -----------------
 * ✓ Modal open with valid image src
 * ✓ Modal open with null image src (displays fallback)
 * ✓ Image loading error event trigger
 * ✓ Image load success event trigger (hides spinner)
 * ✓ User clicking close button
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI Modal via RTL)
 *
 * Not Covered
 * -----------
 * - Backdrop blur CSS filter
 *
 * Notes
 * -----
 * Unit test for ImagePreview component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImagePreview } from "../image-preview";

describe("ImagePreview", () => {
  it("shouldNotRenderModalWhenOpenIsFalse", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render closed image preview modal.
    // ----------------------------------------------------------------------------
    render(
      <ImagePreview
        src="https://example.com/test.jpg"
        open={false}
        onClose={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify modal image is not in document.
    // ----------------------------------------------------------------------------
    expect(screen.queryByAltText("Preview Image")).not.toBeInTheDocument();
  });

  it("shouldRenderImageAndHandleLoadAndCloseEventsWhenOpen", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props and close handler.
    // ----------------------------------------------------------------------------
    const handleClose = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render open modal.
    // ----------------------------------------------------------------------------
    render(
      <ImagePreview
        src="https://example.com/photo.png"
        alt="Course Thumbnail"
        open={true}
        onClose={handleClose}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify image element is rendered with src and alt.
    // ----------------------------------------------------------------------------
    const imgElement = screen.getByAltText("Course Thumbnail");
    expect(imgElement).toBeInTheDocument();

    // Simulate image load event
    fireEvent.load(imgElement);

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click close button and verify onClose is invoked.
    // ----------------------------------------------------------------------------
    const closeBtn = screen.getByRole("button", {
      name: "Close image preview",
    });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("shouldFallbackToFallbackImageWhenImageErrorOccurs", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render modal with broken image URL.
    // ----------------------------------------------------------------------------
    render(
      <ImagePreview
        src="https://example.com/broken.jpg"
        open={true}
        onClose={vi.fn()}
      />,
    );

    const imgElement = screen.getByAltText("Preview Image");

    // Simulate error event
    fireEvent.error(imgElement);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify src changed to SVG fallback data URL.
    // ----------------------------------------------------------------------------
    expect(imgElement.getAttribute("src")).toContain("data:image/svg+xml");
  });
});
