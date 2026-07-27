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

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Layout from "../layout";

vi.mock("@/components/layout/admin/page", () => ({
  AdminLayout: ({ children }: any) => (
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
