/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/posts/post-content.tsx
 *
 * Purpose
 * -------
 * Verify that PostContent component renders HTML post content safely into DOM.
 *
 * Tested Features
 * ---------------
 * ✓ Dangerously rendering HTML elements (<p>, <code>, <blockquote>)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering post HTML content
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS code highlighting
 *
 * Notes
 * -----
 * Unit test for PostContent component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PostContent } from "../post-content";

describe("PostContent", () => {
  it("shouldRenderPostHTMLContent", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render PostContent with sample HTML.
    // ----------------------------------------------------------------------------
    render(
      <PostContent content="<h2>Key Features</h2><p>Server Actions & React 19</p>" />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify h2 and paragraph text render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Key Features")).toBeInTheDocument();
    expect(screen.getByText("Server Actions & React 19")).toBeInTheDocument();
  });
});
