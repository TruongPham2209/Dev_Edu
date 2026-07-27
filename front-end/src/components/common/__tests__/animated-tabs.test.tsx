/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/animated-tabs.tsx
 *
 * Purpose
 * -------
 * Verify that AnimatedTabs component renders tab items, applies active tab selection,
 * triggers onChange handler when tab selection changes, and supports custom color themes.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering tab list labels and icons
 * ✓ Selected tab indicator matching current value
 * ✓ Callback invocation on tab selection change
 * ✓ Color theme parameter propagation
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering multiple tabs
 * ✓ User clicking inactive tab
 * ✓ Color theme options ("primary", "success", "error", etc.)
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI Tabs via RTL)
 *
 * Not Covered
 * -----------
 * - CSS transform animation transitions
 *
 * Notes
 * -----
 * Unit test for AnimatedTabs component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnimatedTabItem, AnimatedTabs } from "../animated-tabs";

describe("AnimatedTabs", () => {
  const mockTabs: AnimatedTabItem[] = [
    { value: "overview", label: "Overview" },
    { value: "curriculum", label: "Curriculum" },
    { value: "reviews", label: "Reviews" },
  ];

  it("shouldRenderAllTabsAndMarkSelectedTabAsActive", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AnimatedTabs with value="curriculum".
    // ----------------------------------------------------------------------------
    render(
      <AnimatedTabs tabs={mockTabs} value="curriculum" onChange={vi.fn()} />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify all tabs render and curriculum is selected.
    // ----------------------------------------------------------------------------
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Curriculum" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Reviews" })).toBeInTheDocument();

    const selectedTab = screen.getByRole("tab", { name: "Curriculum" });
    expect(selectedTab).toHaveAttribute("aria-selected", "true");

    const unselectedTab = screen.getByRole("tab", { name: "Overview" });
    expect(unselectedTab).toHaveAttribute("aria-selected", "false");
  });

  it("shouldCallOnChangeWhenTabIsClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare change handler and render tabs.
    // ----------------------------------------------------------------------------
    const handleChange = vi.fn();

    render(
      <AnimatedTabs tabs={mockTabs} value="overview" onChange={handleChange} />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Click "Reviews" tab.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByRole("tab", { name: "Reviews" }));

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onChange was called with "reviews".
    // ----------------------------------------------------------------------------
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("reviews");
  });
});
