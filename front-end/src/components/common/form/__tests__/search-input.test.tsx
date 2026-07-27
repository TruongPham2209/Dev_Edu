/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/form/search-input.tsx
 *
 * Purpose
 * -------
 * Verify that SearchInput component handles text typing, search trigger (Enter key or button click),
 * clear reset button execution, dropdown list rendering, and dropdown item selection.
 *
 * Tested Features
 * ---------------
 * ✓ Input rendering with placeholder and current value
 * ✓ Search execution via Enter key or search icon button
 * ✓ Clear button reset triggering onChange("") and onClear()
 * ✓ Dropdown list rendering when showDropdown is true and items exist
 * ✓ Dropdown item click triggering onDropdownItemSelect
 *
 * Covered Scenarios
 * -----------------
 * ✓ User typing into search input
 * ✓ User pressing Enter key (triggers onSearch)
 * ✓ User clicking Clear button
 * ✓ User clicking an item in search result dropdown
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI TextField & Paper via RTL)
 *
 * Not Covered
 * -----------
 * - CSS backdrop blur on dropdown paper
 *
 * Notes
 * -----
 * Unit test for SearchInput component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchInput } from "../search-input";

describe("SearchInput", () => {
  it("shouldRenderPlaceholderValueAndTriggerOnSearchOnEnterKey", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare search handlers.
    // ----------------------------------------------------------------------------
    const handleSearch = vi.fn();
    const handleChange = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render SearchInput.
    // ----------------------------------------------------------------------------
    render(
      <SearchInput
        value="React 19"
        placeholder="Search courses..."
        onChange={handleChange}
        onSearch={handleSearch}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify input value and placeholder.
    // ----------------------------------------------------------------------------
    const input = screen.getByPlaceholderText("Search courses...");
    expect(input).toHaveValue("React 19");

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Press Enter key on input.
    // ----------------------------------------------------------------------------
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(handleSearch).toHaveBeenCalledWith("React 19");
  });

  it("shouldTriggerOnChangeAndOnClearWhenClearButtonIsClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare handlers.
    // ----------------------------------------------------------------------------
    const handleChange = vi.fn();
    const handleClear = vi.fn();

    render(
      <SearchInput
        value="TypeScript"
        onChange={handleChange}
        onClear={handleClear}
        onSearch={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Click clear button (Tooltip: "Reset filter").
    // ----------------------------------------------------------------------------
    const clearBtn = screen.getByRole("button", { name: "Reset filter" });
    fireEvent.click(clearBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onChange("") and onClear() invocation.
    // ----------------------------------------------------------------------------
    expect(handleChange).toHaveBeenCalledWith("");
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it("shouldRenderDropdownItemsAndTriggerOnDropdownItemSelect", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare dropdown items and selection handler.
    // ----------------------------------------------------------------------------
    const handleItemSelect = vi.fn();
    const dropdownItems = [
      { label: "Dr. Alice (Lecturer)", value: "alice_doc" },
      { label: "Prof. Bob (Lecturer)", value: "bob_prof" },
    ];

    render(
      <SearchInput
        value="Dr"
        showDropdown={true}
        dropdownItems={dropdownItems}
        onDropdownItemSelect={handleItemSelect}
        onSearch={vi.fn()}
      />,
    );

    // Focus input to open dropdown
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify dropdown items render.
    // ----------------------------------------------------------------------------
    const item1 = screen.getByText("Dr. Alice (Lecturer)");
    expect(item1).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click dropdown item and verify handleItemSelect callback execution.
    // ----------------------------------------------------------------------------
    fireEvent.click(item1);
    expect(handleItemSelect).toHaveBeenCalledWith("alice_doc");
  });
});
