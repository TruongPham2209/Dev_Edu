import React from "react";
/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/layout/lecturer-layout.tsx
 *
 * Purpose
 * -------
 * Verify that LecturerLayout component renders ManageHeader with title "Lecturer workspace"
 * and wraps nested children inside Container.
 *
 * Tested Features
 * ---------------
 * ✓ ManageHeader rendering lecturer title
 * ✓ Container wrapping nested page content
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering LecturerLayout around lecturer dashboard children
 *
 * Mocked Dependencies
 * -------------------
 * - "@/components/layout/components/manage-header" (mocked ManageHeader)
 *
 * Not Covered
 * -----------
 * - CSS backdrop filter blur effects
 *
 * Notes
 * -----
 * Unit test for LecturerLayout component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LecturerLayout } from "../lecturer-layout";

vi.mock("@/components/layout/components/manage-header", () => ({
  ManageHeader: ({ title }: { title?: React.ReactNode }) => (
    <header data-testid="manage-header">{title}</header>
  ),
}));

describe("LecturerLayout", () => {
  it("shouldRenderManageHeaderAndChildrenContent", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render LecturerLayout around test children.
    // ----------------------------------------------------------------------------
    render(
      <LecturerLayout>
        <div data-testid="lecturer-children">Lecturer Dashboard Content</div>
      </LecturerLayout>,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify ManageHeader and children render.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("manage-header")).toHaveTextContent(
      "Lecturer workspace",
    );
    expect(screen.getByTestId("lecturer-children")).toBeInTheDocument();
  });
});
