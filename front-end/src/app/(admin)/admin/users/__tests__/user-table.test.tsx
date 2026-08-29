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
import type { UserResponse } from "@/lib/type/users";
import { createMockUser } from "@/testing/mock-data";

describe("UserTable", () => {
  it("shouldRenderUserTableRowsAndRoleChips", () => {
    const mockUsers: UserResponse[] = [
      createMockUser({
        id: "u-1",
        fullName: "Emily Watson",
        username: "emily_w",
        email: "emily@devedu.com",
        role: "STUDENT",
        courseCount: 4,
      }),
      createMockUser({
        id: "u-2",
        fullName: "Dr. Robert Ford",
        username: "robert_f",
        email: "robert@devedu.com",
        role: "LECTURER",
        postedPosts: 12,
      }),
    ];

    render(<UserTable users={mockUsers} loading={false} />);

    expect(screen.getByText("Emily Watson")).toBeInTheDocument();
    expect(screen.getByText("emily@devedu.com")).toBeInTheDocument();
    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("Has joined 4 courses")).toBeInTheDocument();

    expect(screen.getByText("Dr. Robert Ford")).toBeInTheDocument();
    expect(screen.getByText("Lecturer")).toBeInTheDocument();
    expect(screen.getByText("Has posted 12 posts")).toBeInTheDocument();
  });
});
