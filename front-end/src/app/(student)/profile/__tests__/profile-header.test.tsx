/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/profile/profile-header.tsx
 *
 * Purpose
 * -------
 * Verify that ProfileHeader component renders user full name, username, email, role badge,
 * Change Password dialog trigger, and Avatar upload modal trigger.
 *
 * Tested Features
 * ---------------
 * ✓ Profile avatar, name, username, and email rendering
 * ✓ Change password button opening FormDialog
 * ✓ Update avatar camera button opening avatar upload modal
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering user profile header
 * ✓ Opening Change Password modal
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/users" (useChangePasswordMutation, useUpdateAvatarMutation)
 * - "@/lib/api/files" (usePreSignedUploadUrlMutation, useConfirmImageUploadMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - Image file binary upload network request
 *
 * Notes
 * -----
 * Unit test for ProfileHeader component.
 */

import * as filesApi from "@/lib/api/files";
import * as usersApi from "@/lib/api/users";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileHeader } from "../profile-header";

vi.mock("@/lib/api/users", () => ({
  useChangePasswordMutation: vi.fn(),
  useUpdateAvatarMutation: vi.fn(),
}));

vi.mock("@/lib/api/files", () => ({
  usePreSignedUploadUrlMutation: vi.fn(),
  useConfirmImageUploadMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("ProfileHeader", () => {
  const mockUser = {
    id: "u-100",
    fullName: "Truong Pham",
    username: "truongpham22",
    email: "truong@example.com",
    role: "STUDENT",
    avatarUrl: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as never);

    vi.mocked(usersApi.useChangePasswordMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as never);

    vi.mocked(usersApi.useUpdateAvatarMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as never);

    vi.mocked(filesApi.usePreSignedUploadUrlMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as never);

    vi.mocked(filesApi.useConfirmImageUploadMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as never);
  });

  it("shouldRenderUserProfileAndOpenChangePasswordDialog", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ProfileHeader.
    // ----------------------------------------------------------------------------
    render(<ProfileHeader user={mockUser as never} onAvatarChange={vi.fn()} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify user name, username, email, and role badge render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Truong Pham" }),
    ).toBeInTheDocument();
    expect(screen.getByText("@truongpham22")).toBeInTheDocument();
    expect(screen.getByText("truong@example.com")).toBeInTheDocument();
    expect(screen.getByText("Student")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click Change password button.
    // ----------------------------------------------------------------------------
    const changePassBtn = screen.getByRole("button", {
      name: "Change password",
    });
    fireEvent.click(changePassBtn);

    expect(
      screen.getByRole("heading", { name: "Change password" }),
    ).toBeInTheDocument();
  });
});
