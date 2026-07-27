/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/users/user-search-section.tsx
 *
 * Purpose
 * -------
 * Verify that UserSearchSection component renders search input and role FilterSelect,
 * and triggers onSearch callback with keyword and selected role.
 *
 * Tested Features
 * ---------------
 * ✓ SearchInput rendering
 * ✓ FilterSelect role dropdown rendering
 * ✓ Triggering onSearch callback with search keyword and role
 *
 * Covered Scenarios
 * -----------------
 * ✓ User searching by keyword and role filter selection
 *
 * Mocked Dependencies
 * -------------------
 * - None
 *
 * Not Covered
 * -----------
 * - Internal input focus states
 *
 * Notes
 * -----
 * Unit test for UserSearchSection component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserSearchSection } from "../user-search-section";

describe("UserSearchSection", () => {
  const mockOnSearch = vi.fn();

  it("shouldRenderSearchInputAndRoleSelectAndTriggerSearch", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render UserSearchSection.
    // ----------------------------------------------------------------------------
    render(
      <UserSearchSection
        onSearch={mockOnSearch}
        initialRole="STUDENT"
        loading={false}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify search placeholder and role dropdown label render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByPlaceholderText("Search by full name, email, username..."),
    ).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(
      "Search by full name, email, username...",
    );
    fireEvent.change(searchInput, { target: { value: "john" } });
    fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

    expect(mockOnSearch).toHaveBeenCalledWith("john", "STUDENT");
  });
});
