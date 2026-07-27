/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/users.ts
 *
 * Purpose
 * -------
 * Verify that users API helper functions and React Query hooks handle user profile queries,
 * registration, password change, avatar update, and user search queries.
 *
 * Tested Features
 * ---------------
 * ✓ useMeQuery query hook (/api/v1/me)
 * ✓ useChangePasswordMutation mutation hook (/api/v1/users/change-password)
 * ✓ useUpdateAvatarMutation mutation hook (/api/v1/users/avatar)
 * ✓ useSearchUsersQuery query hook (/api/v1/users)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Fetching current logged-in user profile
 * ✓ Changing user password
 * ✓ Updating avatar objectKey
 * ✓ Searching users list by role
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/client" (apiGet, apiPost, apiPut)
 * - "@/app/login/actions" (loginAction)
 *
 * Not Covered
 * -----------
 * - Real JWT token verification
 *
 * Notes
 * -----
 * Unit test for users API endpoints.
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useMeQuery,
  useChangePasswordMutation,
  useUpdateAvatarMutation,
  useSearchUsersQuery,
} from "../users";
import * as client from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
}));

vi.mock("@/app/login/actions", () => ({
  loginAction: vi.fn(),
}));

describe("Users API", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldExecuteUseMeQueryHook", async () => {
    const mockUser = { id: "u-1", fullName: "Truong Pham", role: "STUDENT" };
    vi.mocked(client.apiGet).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useMeQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.apiGet).toHaveBeenCalledWith("/api/v1/me");
    expect(result.current.data).toEqual(mockUser);
  });

  it("shouldExecuteUseChangePasswordMutationHook", async () => {
    vi.mocked(client.apiPost).mockResolvedValue("Password changed");

    const { result } = renderHook(() => useChangePasswordMutation(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        oldPassword: "OldPassword123!",
        newPassword: "NewPassword123!",
      });
    });

    expect(client.apiPost).toHaveBeenCalledWith("/api/v1/users/change-password", {
      oldPassword: "OldPassword123!",
      newPassword: "NewPassword123!",
    });
  });

  it("shouldExecuteUseUpdateAvatarMutationHook", async () => {
    vi.mocked(client.apiPut).mockResolvedValue("Avatar updated");

    const { result } = renderHook(() => useUpdateAvatarMutation(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync("avatars/new-avatar.png");
    });

    expect(client.apiPut).toHaveBeenCalledWith("/api/v1/users/avatar", {
      avatarObjectKey: "avatars/new-avatar.png",
    });
  });

  it("shouldExecuteUseSearchUsersQueryHook", async () => {
    const mockUsersPaging = { contents: [{ id: "u-2" }], totalPages: 1 };
    vi.mocked(client.apiGet).mockResolvedValue(mockUsersPaging);

    const { result } = renderHook(
      () => useSearchUsersQuery(0, "john", "STUDENT" as any),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.apiGet).toHaveBeenCalledWith(
      "/api/v1/users?page=0&role=STUDENT&keyword=john",
    );
    expect(result.current.data).toEqual(mockUsersPaging);
  });
});
