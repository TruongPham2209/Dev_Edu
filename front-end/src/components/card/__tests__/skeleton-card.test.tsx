/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/card/skeleton-card.tsx
 *
 * Purpose
 * -------
 * Verify that SkeletonCard component renders MUI Card container and Skeleton
 * placeholders.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering Card container element
 * ✓ Rendering Skeleton components
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering loading card skeleton placeholder
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS wave animation
 *
 * Notes
 * -----
 * Unit test for SkeletonCard component.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkeletonCard } from "../skeleton-card";

describe("SkeletonCard", () => {
  it("shouldRenderCardContainerWithSkeletons", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render SkeletonCard component.
    // ----------------------------------------------------------------------------
    const { container } = render(<SkeletonCard />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify Card and Skeleton elements exist in DOM.
    // ----------------------------------------------------------------------------
    expect(container.querySelector(".MuiCard-root")).toBeInTheDocument();
    expect(
      container.querySelectorAll(".MuiSkeleton-root").length,
    ).toBeGreaterThan(0);
  });
});
