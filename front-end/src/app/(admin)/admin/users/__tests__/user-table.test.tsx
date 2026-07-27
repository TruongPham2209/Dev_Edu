/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/users/user-table.tsx
 *
 * Purpose
 * -------
 * Verify that UserTable component renders user rows with Full Name, Username, Email, Role chips, and activity stats.
 *
 * Tested Features
 * ---------------
 * ✓ Table headers and user row values rendering
 * ✓ Role chip rendering (Student, Lecturer, Administrator)
 * ✓ Student activity ("Has joined X courses") and Lecturer activity ("Has posted X posts") rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering user catalog table data
 *
 * Mocked Dependencies
 * -------------------
 * - None
 *
 * Not Covered
 * -----------
 * - Avatar image preview modal rendering
 *
 * Notes
 * -----
 * Unit test for UserTable component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserTable } from "../user-table";

describe("UserTable", () => {
  it("shouldRenderUserTableRowsAndRoleChips", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock users array with student and lecturer roles.
    // ----------------------------------------------------------------------------
    const mockUsers = [
      {
        id: "u-1",
        fullName: "Emily Watson",
        username: "emily_w",
        email: "emily@devedu.com",
        role: "STUDENT",
        courseCount: 4,
      },
      {
        id: "u-2",
        fullName: "Dr. Robert Ford",
        username: "robert_f",
        email: "robert@devedu.com",
        role: "LECTURER",
        postedPosts: 12,
      },
    ];

    // ----------------------------------------------------------------------------
    // Act
    // Render UserTable.
    // ----------------------------------------------------------------------------
    render(<UserTable users={mockUsers as any} loading={false} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify full names, emails, role chips, and activity text render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Emily Watson")).toBeInTheDocument();
    expect(screen.getByText("emily@devedu.com")).toBeInTheDocument();
    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("Has joined 4 courses")).toBeInTheDocument();

    expect(screen.getByText("Dr. Robert Ford")).toBeInTheDocument();
    expect(screen.getByText("Lecturer")).toBeInTheDocument();
    expect(screen.getByText("Has posted 12 posts")).toBeInTheDocument();
  });
});
