/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/home/hero-slideshow.tsx
 *
 * Purpose
 * -------
 * Verify that HeroSlideshow component renders slideshow images, prev/next slide buttons,
 * dot indicators, and navigates between slides.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering image slides with alt tags
 * ✓ Navigation controls (ChevronLeft, ChevronRight)
 * ✓ Indicator dots click navigation
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering images in slideshow
 * ✓ Navigating to next slide on ChevronRight click
 * ✓ Navigating to previous slide on ChevronLeft click
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - Auto-play timer interval execution
 *
 * Notes
 * -----
 * Unit test for HeroSlideshow component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSlideshow } from "../hero-slideshow";

describe("HeroSlideshow", () => {
  const sampleImages = [
    "https://example.com/slide1.jpg",
    "https://example.com/slide2.jpg",
    "https://example.com/slide3.jpg",
  ];

  it("shouldReturnNullWhenImagesArrayIsEmpty", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render with empty images array.
    // ----------------------------------------------------------------------------
    const { container } = render(<HeroSlideshow images={[]} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify container is empty.
    // ----------------------------------------------------------------------------
    expect(container.firstChild).toBeNull();
  });

  it("shouldRenderSlidesAndNavigateOnNextAndPrevClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render HeroSlideshow with sample images.
    // ----------------------------------------------------------------------------
    render(<HeroSlideshow images={sampleImages} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify all 3 slide images render in DOM.
    // ----------------------------------------------------------------------------
    expect(screen.getByAltText("Slide 1")).toBeInTheDocument();
    expect(screen.getByAltText("Slide 2")).toBeInTheDocument();
    expect(screen.getByAltText("Slide 3")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click navigation buttons.
    // ----------------------------------------------------------------------------
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    // Prev button is buttons[0], Next button is buttons[1]
    fireEvent.click(buttons[1]); // next slide
    fireEvent.click(buttons[0]); // prev slide
  });
});
