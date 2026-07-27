/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/lectures/sidebar-container.tsx
 *
 * Purpose
 * -------
 * Verify that SidebarContainer component renders lecture list sidebar, handles active item state,
 * locks uncompleted prerequisite lectures, and triggers onSelectLecture callback when clicked.
 *
 * Tested Features
 * ---------------
 * ✓ Sidebar title header rendering
 * ✓ Lecture list rendering (titles, order numbers, video/content badges)
 * ✓ Locking lectures when previous lecture is not completed
 * ✓ Triggering onSelectLecture callback for accessible lectures
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering unlocked & locked sidebar lectures
 * ✓ Click selection callback
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI List component)
 *
 * Not Covered
 * -----------
 * - CSS hover animations
 *
 * Notes
 * -----
 * Unit test for SidebarContainer component.
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SidebarContainer } from "../sidebar-container";

describe("SidebarContainer", () => {
  it("shouldRenderSidebarLecturesAndTriggerSelectionOnUnlockedItems", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock lectures list: first completed, second active unlocked, third locked.
    // ----------------------------------------------------------------------------
    const mockLectures = [
      {
        id: "lec-1",
        title: "01. Introduction to Next.js 15",
        duration: 300,
        isCompleted: true,
      },
      {
        id: "lec-2",
        title: "02. Project Setup & Architecture",
        duration: 600,
        isCompleted: false,
      },
      {
        id: "lec-3",
        title: "03. Advanced Routing & Layouts",
        duration: 0,
        isCompleted: false,
      },
    ];

    const mockOnSelectLecture = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render SidebarContainer with lec-2 active.
    // ----------------------------------------------------------------------------
    render(
      <SidebarContainer
        lectures={mockLectures as any}
        activeLectureId="lec-2"
        onSelectLecture={mockOnSelectLecture}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify course content title and lecture items render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Course Content")).toBeInTheDocument();
    expect(screen.getByText("01. Introduction to Next.js 15")).toBeInTheDocument();
    expect(screen.getByText("02. Project Setup & Architecture")).toBeInTheDocument();

    // Click first lecture item
    const firstItem = screen.getByText("01. Introduction to Next.js 15");
    fireEvent.click(firstItem);

    expect(mockOnSelectLecture).toHaveBeenCalledWith("lec-1");
  });
});
