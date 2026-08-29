import React from "react";
/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/layout.tsx
 *
 * Purpose
 * -------
 * Verify that Admin Console Layout wraps children inside AdminLayout component.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering children within AdminLayout
 *
 * Covered Scenarios
 * -----------------
 * ✓ Layout wrapping
 *
 * Mocked Dependencies
 * -------------------
 * - "@/components/layout/admin/page" (mocked AdminLayout)
 *
 * Not Covered
 * -----------
 * - Next.js Metadata evaluation
 *
 * Notes
 * -----
 * Unit test for Admin Layout.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Layout from "../layout";

vi.mock("@/components/layout/admin-layout", () => ({
  AdminLayout: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="admin-layout-wrapper">{children}</div>
  ),
}));

describe("Admin Console Layout", () => {
  it("shouldWrapChildrenInsideAdminLayout", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render Layout with test children.
    // ----------------------------------------------------------------------------
    render(
      <Layout>
        <div data-testid="admin-child-content">Admin Content</div>
      </Layout>,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify wrapper and children render.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("admin-layout-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("admin-child-content")).toBeInTheDocument();
  });
});
