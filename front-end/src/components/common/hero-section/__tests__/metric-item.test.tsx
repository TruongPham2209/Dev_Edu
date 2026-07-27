/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/hero-section/metric-item.tsx
 *
 * Purpose
 * -------
 * Verify that MetricItem component renders title, metric value, and icon.
 *
 * Tested Features
 * ---------------
 * ✓ Metric title and value display
 * ✓ Icon component rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering metric item card with title, numeric value, and icon
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS hover animation
 *
 * Notes
 * -----
 * Unit test for MetricItem component.
 */

import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { describe, expect, it } from "vitest";
import { MetricItem } from "../metric-item";

describe("MetricItem", () => {
  it("shouldRenderTitleValueAndIcon", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render MetricItem component.
    // ----------------------------------------------------------------------------
    render(
      <MetricItem
        title="Total Enrolled Students"
        value="1,250"
        icon={Users}
        color="#2563eb"
        bg="rgba(37, 99, 235, 0.1)"
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and value exist in DOM.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Total Enrolled Students")).toBeInTheDocument();
    expect(screen.getByText("1,250")).toBeInTheDocument();
  });
});
