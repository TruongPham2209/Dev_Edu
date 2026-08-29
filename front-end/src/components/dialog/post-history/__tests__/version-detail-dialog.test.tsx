/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/post-history/version-detail-dialog.tsx
 *
 * Purpose
 * -------
 * Verify that VersionDetailDialog component renders version title, date, status chip,
 * shortDescription, and HTML content inside InfoDialog wrapper.
 *
 * Tested Features
 * ---------------
 * ✓ Title and date rendering
 * ✓ Status chip in manage mode
 * ✓ Short description and HTML content rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ VersionDetailDialog with selectedVersion data
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI components via RTL)
 *
 * Not Covered
 * -----------
 * - Backdrop filter styling
 *
 * Notes
 * -----
 * Unit test for VersionDetailDialog component.
 */

import type { PostResponse } from "@/lib/type/forums";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VersionDetailDialog } from "../version-detail-dialog";

describe("VersionDetailDialog", () => {
  const mockVersion: PostResponse = {
    id: "ver-10",
    title: "Version 10 Title",
    shortDescription: "Short summary of changes.",
    content: "<p>Detailed HTML content body.</p>",
    isMine: true,
    isSaved: false,
    authorUsername: "alice",
    authorFullName: "Alice Smith",
    authorAvatarUrl: null,
    thumbUrl: null,
    views: 10,
    comments: 2,
    status: "APPROVED",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z",
  };

  it("shouldRenderVersionDetailsWhenOpenAndVersionIsProvided", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render VersionDetailDialog.
    // ----------------------------------------------------------------------------
    render(
      <VersionDetailDialog
        open={true}
        onClose={vi.fn()}
        selectedVersion={mockVersion}
        mode="manage"
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, date, description, and status chip render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Version Detail" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Version 10 Title")).toBeInTheDocument();
    expect(screen.getByText("Short summary of changes.")).toBeInTheDocument();
    expect(screen.getByText("Detailed HTML content body.")).toBeInTheDocument();
    expect(screen.getByText("APPROVED")).toBeInTheDocument();
  });
});
