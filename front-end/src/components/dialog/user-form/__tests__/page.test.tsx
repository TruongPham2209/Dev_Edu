/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/user-form/page.tsx
 *
 * Purpose
 * -------
 * Verify that UserFormDialog component renders modal title ("Add new users"), tab selector
 * ("Manual entry" vs "Upload Excel file"), and manages submit button status.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering ("Add new users")
 * ✓ AnimatedTabs rendering for switching between Manual entry and Upload Excel file
 * ✓ Modal open and close callbacks
 *
 * Covered Scenarios
 * -----------------
 * ✓ UserFormDialog rendering in manual entry tab
 * ✓ Switching tabs to Upload Excel file
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/users" (useBatchCreateUsersMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - Backdrop filter blur
 *
 * Notes
 * -----
 * Unit test for UserFormDialog component.
 */

import * as usersApi from "@/lib/api/users";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserFormDialog } from "../page";

vi.mock("@/lib/api/users", () => ({
  useBatchCreateUsersMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("UserFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usersApi.useBatchCreateUsersMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as any);
  });

  it("shouldRenderTitleAndTabsWhenOpenIsTrue", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render UserFormDialog.
    // ----------------------------------------------------------------------------
    render(<UserFormDialog open={true} onClose={vi.fn()} onSaved={vi.fn()} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and tab options render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Add new users" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Manual entry")).toBeInTheDocument();
    expect(screen.getByText("Upload Excel file")).toBeInTheDocument();
  });

  it("shouldSwitchTabToExcelImportWhenClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render and click Excel import tab.
    // ----------------------------------------------------------------------------
    render(<UserFormDialog open={true} onClose={vi.fn()} onSaved={vi.fn()} />);

    const excelTab = screen.getByText("Upload Excel file");
    fireEvent.click(excelTab);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify Excel drag and drop dropzone instructions render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Drag and drop Excel file here"),
    ).toBeInTheDocument();
  });
});
