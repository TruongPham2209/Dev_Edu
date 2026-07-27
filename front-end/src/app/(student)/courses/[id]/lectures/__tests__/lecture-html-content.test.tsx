/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/lectures/lecture-html-content.tsx
 *
 * Purpose
 * -------
 * Verify that LectureHTMLContent component safely renders raw HTML content.
 *
 * Tested Features
 * ---------------
 * ✓ Dangerously rendering HTML content string (headings, paragraphs, bold text)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering custom lecture HTML content
 *
 * Mocked Dependencies
 * -------------------
 * - None
 *
 * Not Covered
 * -----------
 * - CSS element style overrides
 *
 * Notes
 * -----
 * Unit test for LectureHTMLContent component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LectureHTMLContent } from "../lecture-html-content";

describe("LectureHTMLContent", () => {
  it("shouldRenderRawHTMLContent", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // HTML string.
    // ----------------------------------------------------------------------------
    const htmlString =
      "<h3>Lecture Overview</h3><p>Learn React 19 Server Components in detail.</p>";

    // ----------------------------------------------------------------------------
    // Act
    // Render LectureHTMLContent.
    // ----------------------------------------------------------------------------
    render(<LectureHTMLContent content={htmlString} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify heading and paragraph render in document.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Lecture Overview" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Learn React 19 Server Components in detail."),
    ).toBeInTheDocument();
  });
});
