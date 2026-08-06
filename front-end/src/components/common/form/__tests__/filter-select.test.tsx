/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/form/filter-select.tsx
 *
 * Purpose
 * -------
 * Verify that FilterSelect component renders MUI Select dropdown, displays default
 * label, list of filter items, selected value, and invokes onChange handler on selection.
 *
 * Tested Features
 * ---------------
 * ✓ Select rendering with label
 * ✓ Displaying default label when value equals defaultValue
 * ✓ Rendering filter options list
 * ✓ Selection change event triggering onChange callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ FilterSelect rendered with items list and default label
 * ✓ User selecting an option from dropdown
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI Select via RTL)
 *
 * Not Covered
 * -----------
 * - CSS backdrop blur on paper dropdown
 *
 * Notes
 * -----
 * Unit test for FilterSelect component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterItem, FilterSelect } from "../filter-select";

describe("FilterSelect", () => {
  const mockItems: FilterItem[] = [
    { id: "cat-1", title: "Web Development" },
    { id: "cat-2", title: "Data Science" },
  ];

  it("shouldRenderLabelAndDefaultLabelWhenValueIsDefault", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render FilterSelect with value = "ALL" and defaultLabel = "All Categories".
    // ----------------------------------------------------------------------------
    render(
      <FilterSelect
        label="Category"
        value="ALL"
        defaultValue="ALL"
        defaultLabel="All Categories"
        items={mockItems}
        onChange={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify label and defaultLabel render.
    // ----------------------------------------------------------------------------
    expect(screen.getAllByText("Category")[0]).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();
  });

  it("shouldRenderSelectedItemTitleWhenValueMatchesAnItem", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render with value = "cat-2".
    // ----------------------------------------------------------------------------
    render(
      <FilterSelect
        label="Category"
        value="cat-2"
        items={mockItems}
        onChange={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "Data Science" option title is rendered in combobox value.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Data Science")).toBeInTheDocument();
  });

  it("shouldInvokeOnChangeWhenUserSelectsAnOption", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare onChange handler.
    // ----------------------------------------------------------------------------
    const handleChange = vi.fn();

    render(
      <FilterSelect
        label="Category"
        value="ALL"
        defaultValue="ALL"
        defaultLabel="All Categories"
        items={mockItems}
        onChange={handleChange}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Click combobox button to open menu.
    // ----------------------------------------------------------------------------
    const selectButton = screen.getByRole("combobox");
    fireEvent.mouseDown(selectButton);

    // Click "Web Development" MenuItem
    const option = screen.getByText("Web Development");
    fireEvent.click(option);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onChange was called with "cat-1".
    // ----------------------------------------------------------------------------
    expect(handleChange).toHaveBeenCalledWith("cat-1");
  });

  it("shouldRenderMatchingItemTitleWhenValueIsALLWithoutDefaultLabel", () => {
    const itemsWithAll: FilterItem[] = [
      { id: "ALL", title: "All Submissions" },
      { id: "PENDING", title: "Needs Grading" },
    ];

    render(
      <FilterSelect
        label="Status"
        value="ALL"
        items={itemsWithAll}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("All Submissions")).toBeInTheDocument();
  });
});
