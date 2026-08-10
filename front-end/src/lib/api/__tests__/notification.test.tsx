/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/notification.ts
 *
 * Purpose
 * -------
 * Verify that notification API helper functions and React Query custom hooks
 * send correct HTTP requests to corresponding backend endpoints and invalidate cache on mutations.
 *
 * Tested Features
 * ---------------
 * ✓ getNotifications API call (/api/v1/notifications)
 * ✓ getUnreadNotificationCount API call (/api/v1/notifications/unread-count)
 * ✓ markNotificationAsRead API call (/api/v1/notifications/read)
 * ✓ createGroupNotification API call (/api/v1/notifications/group)
 * ✓ deleteGroupNotification API call (/api/v1/notifications/group/:id)
 * ✓ deletePersonalNotification API call (/api/v1/notifications/:id)
 * ✓ getAllGroupNotifications API call (/api/v1/notifications/group/all)
 * ✓ React Query hooks (useNotificationsQuery, useNotificationsInfiniteQuery, useUnreadNotificationCountQuery, useMarkNotificationAsReadMutation, useCreateGroupNotificationMutation, useDeleteGroupNotificationMutation, useDeletePersonalNotificationMutation, useAllGroupNotificationsInfiniteQuery)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Fetching notifications with and without cursor pagination
 * ✓ Fetching unread notification counts
 * ✓ Marking notification(s) as read
 * ✓ Creating group notification request dispatch
 * ✓ Soft deleting group announcement and personal notification
 * ✓ Invalidating query cache on mutation success
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/client" (apiGet, apiPost, apiPut, apiDelete)
 *
 * Not Covered
 * -----------
 * - Real backend network communication
 *
 * Notes
 * -----
 * Unit test for notification API module.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../client";
import {
  createGroupNotification,
  deleteGroupNotification,
  deletePersonalNotification,
  getAllGroupNotifications,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  useAllGroupNotificationsInfiniteQuery,
  useCreateGroupNotificationMutation,
  useDeleteGroupNotificationMutation,
  useDeletePersonalNotificationMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsInfiniteQuery,
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
} from "../notification";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe("Notification API", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldCallApiGetForNotificationsWithoutCursor", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare mock notification paging payload.
    // ----------------------------------------------------------------------------
    const mockPaging = {
      contents: [{ id: "n-1", title: "New Assignment" }],
      nextCursor: "cursor-123",
    };
    vi.mocked(client.apiGet).mockResolvedValue(mockPaging);

    // ----------------------------------------------------------------------------
    // Act
    // Call getNotifications without cursor.
    // ----------------------------------------------------------------------------
    const result = await getNotifications();

    // ----------------------------------------------------------------------------
    // Assert
    // Verify apiGet call path and response payload.
    // ----------------------------------------------------------------------------
    expect(client.apiGet).toHaveBeenCalledWith("/api/v1/notifications");
    expect(result).toEqual(mockPaging);
  });

  it("shouldCallApiGetForNotificationsWithCursor", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare mock notification paging payload.
    // ----------------------------------------------------------------------------
    const mockPaging = { contents: [], nextCursor: null };
    vi.mocked(client.apiGet).mockResolvedValue(mockPaging);

    // ----------------------------------------------------------------------------
    // Act
    // Call getNotifications with cursor parameter.
    // ----------------------------------------------------------------------------
    const result = await getNotifications("cursor-abc");

    // ----------------------------------------------------------------------------
    // Assert
    // Verify apiGet call with cursor query string.
    // ----------------------------------------------------------------------------
    expect(client.apiGet).toHaveBeenCalledWith(
      "/api/v1/notifications?cursor=cursor-abc",
    );
    expect(result).toEqual(mockPaging);
  });

  it("shouldCallApiGetForUnreadNotificationCount", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare mock unread count response.
    // ----------------------------------------------------------------------------
    const mockUnread = {
      personalUnreadCount: 3,
      groupUnreadCount: 2,
      totalUnreadCount: 5,
    };
    vi.mocked(client.apiGet).mockResolvedValue(mockUnread);

    // ----------------------------------------------------------------------------
    // Act
    // Call getUnreadNotificationCount.
    // ----------------------------------------------------------------------------
    const result = await getUnreadNotificationCount();

    // ----------------------------------------------------------------------------
    // Assert
    // Verify endpoint and payload.
    // ----------------------------------------------------------------------------
    expect(client.apiGet).toHaveBeenCalledWith(
      "/api/v1/notifications/unread-count",
    );
    expect(result).toEqual(mockUnread);
  });

  it("shouldCallApiPutForMarkNotificationAsReadWithParams", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock successful mark as read response.
    // ----------------------------------------------------------------------------
    vi.mocked(client.apiPut).mockResolvedValue("SUCCESS");

    // ----------------------------------------------------------------------------
    // Act
    // Call markNotificationAsRead with id and category.
    // ----------------------------------------------------------------------------
    const result = await markNotificationAsRead({
      id: "n-100",
      category: "PERSONAL",
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify apiPut URL with query parameters.
    // ----------------------------------------------------------------------------
    expect(client.apiPut).toHaveBeenCalledWith(
      "/api/v1/notifications/read?id=n-100&category=PERSONAL",
      {},
    );
    expect(result).toBe("SUCCESS");
  });

  it("shouldCallApiPutForMarkAllNotificationsAsReadWithoutParams", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock response.
    // ----------------------------------------------------------------------------
    vi.mocked(client.apiPut).mockResolvedValue("SUCCESS");

    // ----------------------------------------------------------------------------
    // Act
    // Call markNotificationAsRead without arguments.
    // ----------------------------------------------------------------------------
    await markNotificationAsRead();

    // ----------------------------------------------------------------------------
    // Assert
    // Verify apiPut base URL.
    // ----------------------------------------------------------------------------
    expect(client.apiPut).toHaveBeenCalledWith(
      "/api/v1/notifications/read",
      {},
    );
  });

  it("shouldCallApiPostForCreateGroupNotification", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare creation request and expected response.
    // ----------------------------------------------------------------------------
    const requestPayload = {
      title: "System Update",
      content: "Maintenance tonight",
      targetRoles: ["STUDENT" as const],
    };
    const responsePayload = {
      id: "gn-1",
      title: "System Update",
      category: "GROUP" as const,
      createdAt: "2026-08-10T10:00:00Z",
    };
    vi.mocked(client.apiPost).mockResolvedValue(responsePayload);

    // ----------------------------------------------------------------------------
    // Act
    // Dispatch group notification creation.
    // ----------------------------------------------------------------------------
    const result = await createGroupNotification(requestPayload);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify apiPost parameters.
    // ----------------------------------------------------------------------------
    expect(client.apiPost).toHaveBeenCalledWith(
      "/api/v1/notifications/group",
      requestPayload,
    );
    expect(result).toEqual(responsePayload);
  });

  it("shouldCallApiDeleteForDeleteGroupNotification", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock delete success.
    // ----------------------------------------------------------------------------
    vi.mocked(client.apiDelete).mockResolvedValue("DELETED");

    // ----------------------------------------------------------------------------
    // Act
    // Call deleteGroupNotification with ID.
    // ----------------------------------------------------------------------------
    const result = await deleteGroupNotification("gn-99");

    // ----------------------------------------------------------------------------
    // Assert
    // Verify apiDelete path.
    // ----------------------------------------------------------------------------
    expect(client.apiDelete).toHaveBeenCalledWith(
      "/api/v1/notifications/group/gn-99",
    );
    expect(result).toBe("DELETED");
  });

  it("shouldCallApiDeleteForDeletePersonalNotification", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock delete success.
    // ----------------------------------------------------------------------------
    vi.mocked(client.apiDelete).mockResolvedValue("DELETED");

    // ----------------------------------------------------------------------------
    // Act
    // Call deletePersonalNotification.
    // ----------------------------------------------------------------------------
    const result = await deletePersonalNotification("pn-12");

    // ----------------------------------------------------------------------------
    // Assert
    // Verify apiDelete path.
    // ----------------------------------------------------------------------------
    expect(client.apiDelete).toHaveBeenCalledWith(
      "/api/v1/notifications/pn-12",
    );
    expect(result).toBe("DELETED");
  });

  it("shouldCallApiGetForGetAllGroupNotifications", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock all group notifications payload.
    // ----------------------------------------------------------------------------
    const mockPaging = { contents: [{ id: "gn-1" }], nextCursor: null };
    vi.mocked(client.apiGet).mockResolvedValue(mockPaging);

    // ----------------------------------------------------------------------------
    // Act
    // Call getAllGroupNotifications.
    // ----------------------------------------------------------------------------
    const result = await getAllGroupNotifications("c-next");

    // ----------------------------------------------------------------------------
    // Assert
    // Verify endpoint URL.
    // ----------------------------------------------------------------------------
    expect(client.apiGet).toHaveBeenCalledWith(
      "/api/v1/notifications/group/all?cursor=c-next",
    );
    expect(result).toEqual(mockPaging);
  });

  it("shouldExecuteUseNotificationsQueryHook", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock query response.
    // ----------------------------------------------------------------------------
    const mockData = { contents: [{ id: "n-1" }], nextCursor: undefined };
    vi.mocked(client.apiGet).mockResolvedValue(mockData);

    // ----------------------------------------------------------------------------
    // Act
    // Render useNotificationsQuery hook.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useNotificationsQuery("c-1"), {
      wrapper,
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Wait for query success.
    // ----------------------------------------------------------------------------
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("shouldExecuteUseNotificationsInfiniteQueryHook", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock page 1 payload.
    // ----------------------------------------------------------------------------
    const page1 = { contents: [{ id: "n-1" }], nextCursor: "page-2-cursor" };
    vi.mocked(client.apiGet).mockResolvedValue(page1);

    // ----------------------------------------------------------------------------
    // Act
    // Render useNotificationsInfiniteQuery hook.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useNotificationsInfiniteQuery(), {
      wrapper,
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify data pages structure.
    // ----------------------------------------------------------------------------
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]).toEqual(page1);
    expect(result.current.hasNextPage).toBe(true);
  });

  it("shouldExecuteUseUnreadNotificationCountQueryHook", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock count.
    // ----------------------------------------------------------------------------
    const mockCount = {
      personalUnreadCount: 1,
      groupUnreadCount: 1,
      totalUnreadCount: 2,
    };
    vi.mocked(client.apiGet).mockResolvedValue(mockCount);

    // ----------------------------------------------------------------------------
    // Act
    // Render useUnreadNotificationCountQuery.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useUnreadNotificationCountQuery(), {
      wrapper,
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify success.
    // ----------------------------------------------------------------------------
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCount);
  });

  it("shouldInvalidateQueryCacheWhenMarkNotificationAsReadMutationSucceeds", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock apiPut response and spy invalidateQueries.
    // ----------------------------------------------------------------------------
    vi.mocked(client.apiPut).mockResolvedValue("SUCCESS");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    // ----------------------------------------------------------------------------
    // Act
    // Execute useMarkNotificationAsReadMutation hook.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useMarkNotificationAsReadMutation(), {
      wrapper,
    });
    result.current.mutate({ id: "n-1" });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify mutation success and query cache invalidation.
    // ----------------------------------------------------------------------------
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notifications"] });
  });

  it("shouldInvalidateQueryCacheWhenCreateGroupNotificationMutationSucceeds", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock apiPost and spy invalidateQueries.
    // ----------------------------------------------------------------------------
    vi.mocked(client.apiPost).mockResolvedValue({ id: "gn-1" });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    // ----------------------------------------------------------------------------
    // Act
    // Execute useCreateGroupNotificationMutation hook.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useCreateGroupNotificationMutation(), {
      wrapper,
    });
    result.current.mutate({
      title: "Title",
      content: "Content",
      targetRoles: ["STUDENT"],
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify cache invalidation.
    // ----------------------------------------------------------------------------
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notifications"] });
  });

  it("shouldInvalidateQueryCacheWhenDeleteGroupNotificationMutationSucceeds", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock delete and spy invalidate.
    // ----------------------------------------------------------------------------
    vi.mocked(client.apiDelete).mockResolvedValue("OK");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    // ----------------------------------------------------------------------------
    // Act
    // Execute useDeleteGroupNotificationMutation hook.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useDeleteGroupNotificationMutation(), {
      wrapper,
    });
    result.current.mutate("gn-1");

    // ----------------------------------------------------------------------------
    // Assert
    // Verify cache invalidation.
    // ----------------------------------------------------------------------------
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notifications"] });
  });

  it("shouldInvalidateQueryCacheWhenDeletePersonalNotificationMutationSucceeds", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock delete and spy invalidate.
    // ----------------------------------------------------------------------------
    vi.mocked(client.apiDelete).mockResolvedValue("OK");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    // ----------------------------------------------------------------------------
    // Act
    // Execute useDeletePersonalNotificationMutation hook.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(
      () => useDeletePersonalNotificationMutation(),
      { wrapper },
    );
    result.current.mutate("pn-1");

    // ----------------------------------------------------------------------------
    // Assert
    // Verify cache invalidation.
    // ----------------------------------------------------------------------------
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notifications"] });
  });

  it("shouldExecuteUseAllGroupNotificationsInfiniteQueryHook", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock page payload.
    // ----------------------------------------------------------------------------
    const mockPage = { contents: [{ id: "gn-10" }], nextCursor: undefined };
    vi.mocked(client.apiGet).mockResolvedValue(mockPage);

    // ----------------------------------------------------------------------------
    // Act
    // Execute useAllGroupNotificationsInfiniteQuery.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(
      () => useAllGroupNotificationsInfiniteQuery(),
      { wrapper },
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify result.
    // ----------------------------------------------------------------------------
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]).toEqual(mockPage);
  });
});
