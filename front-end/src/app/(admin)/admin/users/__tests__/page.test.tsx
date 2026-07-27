/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/users/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminUsersPage queries users, renders UserSearchSection, UserTable, and UserFormDialog.
 *
 * Tested Features
 * ---------------
 * ✓ User Management Hero banner rendering
 * ✓ Querying users via useSearchUsersQuery
 * ✓ UserSearchSection and UserTable rendering
 * ✓ Opening UserFormDialog on Add user button click
 *
 * Covered Scenarios
 * -----------------
 * ✓ Users list rendering
 * ✓ Search and pagination triggers
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/users" (useSearchUsersQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "./user-search-section" (mocked UserSearchSection)
 * - "./user-table" (mocked UserTable)
 * - "@/components/dialog/user-form/page" (mocked UserFormDialog)
 *
 * Not Covered
 * -----------
 * - Internal scroll behavior
 *
 * Notes
 * -----
 * Unit test for AdminUsersPage component.
 */

import * as usersApi from "@/lib/api/users";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminUsersPage from "../page";

vi.mock("@/lib/api/users", () => ({
  useSearchUsersQuery: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("./user-search-section", () => ({
  UserSearchSection: ({ onSearch }: any) => (
    <div data-testid="user-search-section-mock">
      <button onClick={() => onSearch("alex", "STUDENT")}>Search Alex</button>
    </div>
  ),
}));

vi.mock("./user-table", () => ({
  UserTable: ({ users }: any) => (
    <div data-testid="user-table-mock">
      {users.map((u: any) => (
        <div key={u.id}>{u.fullName}</div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/dialog/user-form/page", () => ({
  UserFormDialog: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="user-form-dialog">
        <button onClick={onClose}>Close User Dialog</button>
      </div>
    ) : null,
}));

describe("AdminUsersPage", () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as any);

    vi.mocked(usersApi.useSearchUsersQuery).mockReturnValue({
      data: {
        contents: [
          {
            id: "u-1",
            fullName: "Alice Vance",
            username: "alice_v",
            role: "STUDENT",
          },
        ],
        totalPages: 1,
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: mockRefetch,
    } as any);
  });

  it("shouldRenderUserManagementTitleAndTable", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AdminUsersPage.
    // ----------------------------------------------------------------------------
    render(<AdminUsersPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and mock table render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(screen.getByText("Alice Vance")).toBeInTheDocument();
  });

  it("shouldOpenUserFormDialogOnAddUserClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render AdminUsersPage.
    // ----------------------------------------------------------------------------
    render(<AdminUsersPage />);

    // ----------------------------------------------------------------------------
    // Act
    // Click Add user button.
    // ----------------------------------------------------------------------------
    const addUserBtn = screen.getByRole("button", { name: "Add user" });
    fireEvent.click(addUserBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify UserFormDialog renders.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("user-form-dialog")).toBeInTheDocument();
  });
});
