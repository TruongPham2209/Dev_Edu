/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/post-history/post-version-list.tsx
 *
 * Purpose
 * -------
 * Verify that PostVersionList component renders list of post versions, displays version numbers
 * (v1, v2), status chips in manage mode, and triggers onViewVersion & onDeleteVersion callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ Version list items rendering (v1, v2...)
 * ✓ Status chips display in manage mode
 * ✓ View version callback execution
 * ✓ Delete version button rendering & execution when mode="manage", isMine=true, status="PENDING"
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering version list in normal mode
 * ✓ Rendering version list in manage mode with delete action
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI components via RTL)
 *
 * Not Covered
 * -----------
 * - CSS hover animations
 *
 * Notes
 * -----
 * Unit test for PostVersionList component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PostVersionList } from "../post-version-list";

describe("PostVersionList", () => {
  const mockVersions = [
    {
      id: "ver-2",
      title: "Updated Post Title",
      content: "<p>Updated content</p>",
      status: "PENDING",
      createdAt: "2026-06-15T10:00:00.000Z",
    },
    {
      id: "ver-1",
      title: "Original Post Title",
      content: "<p>Original content</p>",
      status: "APPROVED",
      createdAt: "2026-06-01T10:00:00.000Z",
    },
  ];

  it("shouldRenderVersionNumbersAndTriggerOnViewVersion", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare callbacks.
    // ----------------------------------------------------------------------------
    const handleView = vi.fn();
    const handleDelete = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render in normal mode.
    // ----------------------------------------------------------------------------
    render(
      <PostVersionList
        versions={mockVersions}
        mode="normal"
        isMine={false}
        onViewVersion={handleView}
        onDeleteVersion={handleDelete}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify version numbers v2 and v1.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText("v1")).toBeInTheDocument();

    expect(screen.getByText("Updated Post Title")).toBeInTheDocument();
    expect(screen.getByText("Original Post Title")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click view details button.
    // ----------------------------------------------------------------------------
    const viewButtons = screen.getAllByRole("button");
    fireEvent.click(viewButtons[0]);

    expect(handleView).toHaveBeenCalledWith(mockVersions[0]);
  });

  it("shouldRenderDeleteButtonInManageModeForPendingOwnVersion", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare callbacks.
    // ----------------------------------------------------------------------------
    const handleView = vi.fn();
    const handleDelete = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render in manage mode with isMine = true.
    // ----------------------------------------------------------------------------
    render(
      <PostVersionList
        versions={mockVersions}
        mode="manage"
        isMine={true}
        onViewVersion={handleView}
        onDeleteVersion={handleDelete}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify status chips and delete button execution.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("APPROVED")).toBeInTheDocument();

    const deleteBtn = screen.getByRole("button", { name: /Delete version/i });
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith("ver-2");
  });
});
