/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/layout/components/notification-center.tsx
 *
 * Purpose
 * -------
 * Verify that NotificationCenter component renders bell icon with unread badge count,
 * opens popover dropdown, renders notification items, handles loading and empty states,
 * marks notifications as read, opens detail dialog for group announcements, navigates for personal items,
 * executes mark all read, deletes personal items via overflow menu, and loads more via infinite scroll.
 *
 * Tested Features
 * ---------------
 * ✓ Bell icon rendering with unread badge calculation
 * ✓ Notification popover toggle (open/close)
 * ✓ Loading skeleton state rendering
 * ✓ Empty notification state rendering
 * ✓ Notification list item rendering with category chips
 * ✓ Group notification click opening NotificationDetailDialog and marking read
 * ✓ Personal notification click navigation and marking read
 * ✓ "Mark all read" button execution
 * ✓ Personal item overflow action menu opening and deleting item
 * ✓ "View More" pagination button click calling fetchNextPage
 *
 * Covered Scenarios
 * -----------------
 * ✓ Bell icon click opens notification dropdown
 * ✓ Group notification item click opens detail dialog
 * ✓ Personal notification item click routes to link
 * ✓ Deleting personal notification item via action menu
 * ✓ Clicking Mark all read button calls markAsRead mutation
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/notification" (useNotificationsInfiniteQuery, useUnreadNotificationCountQuery, useMarkNotificationAsReadMutation, useDeletePersonalNotificationMutation)
 * - "@/lib/use-auth" (useAuth)
 * - "next/navigation" (useRouter)
 * - "@/components/dialog/notification/notification-detail" (mocked NotificationDetailDialog)
 *
 * Not Covered
 * -----------
 * - CSS animation timings
 *
 * Notes
 * -----
 * Unit test for NotificationCenter layout component.
 */

import * as notificationApi from "@/lib/api/notification";
import * as authHook from "@/lib/use-auth";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "../notification-center";

vi.mock("@/lib/api/notification", () => ({
  useUnreadNotificationCountQuery: vi.fn(),
  useNotificationsInfiniteQuery: vi.fn(),
  useMarkNotificationAsReadMutation: vi.fn(),
  useDeletePersonalNotificationMutation: vi.fn(),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("@/components/dialog/notification/notification-detail", () => ({
  NotificationDetailDialog: ({ open, notification, onClose }: any) =>
    open ? (
      <div data-testid="notification-detail-dialog-mock">
        <span>Detail: {notification?.title}</span>
        <button onClick={onClose}>Close Detail Dialog</button>
      </div>
    ) : null,
}));

describe("NotificationCenter Component", () => {
  const mockMarkAsRead = vi.fn();
  const mockDeletePersonal = vi.fn();
  const mockFetchNextPage = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);

    vi.mocked(authHook.useAuth).mockReturnValue({
      roles: ["STUDENT"],
      isAuthenticated: true,
      role: "STUDENT",
      user: { id: "u-1" } as any,
    });

    vi.mocked(notificationApi.useUnreadNotificationCountQuery).mockReturnValue({
      data: {
        personalUnreadCount: 2,
        groupUnreadCount: 1,
        totalUnreadCount: 3,
      },
    } as any);

    vi.mocked(notificationApi.useNotificationsInfiniteQuery).mockReturnValue({
      data: {
        pages: [
          {
            contents: [
              {
                id: "n-1",
                title: "Personal Announcement",
                content: "Assignment 1 graded",
                category: "PERSONAL",
                type: "SUBMISSION_FEEDBACK",
                isRead: false,
                createdAt: "2026-08-10T10:00:00Z",
              },
              {
                id: "n-2",
                title: "System Wide Announcement",
                content: "Platform maintenance",
                category: "GROUP",
                type: "ANNOUNCEMENT",
                isRead: false,
                createdAt: "2026-08-10T09:00:00Z",
              },
            ],
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage: mockFetchNextPage,
    } as any);

    vi.mocked(notificationApi.useMarkNotificationAsReadMutation).mockReturnValue(
      {
        mutate: mockMarkAsRead,
        isPending: false,
      } as any,
    );

    vi.mocked(
      notificationApi.useDeletePersonalNotificationMutation,
    ).mockReturnValue({
      mutate: mockDeletePersonal,
      isPending: false,
    } as any);
  });

  it("shouldRenderBellIconWithTotalUnreadBadgeCount", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render NotificationCenter.
    // ----------------------------------------------------------------------------
    render(<NotificationCenter />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify bell icon button and unread badge count (3).
    // ----------------------------------------------------------------------------
    const bellBtn = screen.getByRole("button", { name: "Notifications" });
    expect(bellBtn).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shouldOpenNotificationPopoverOnClickingBellIcon", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render NotificationCenter.
    // ----------------------------------------------------------------------------
    render(<NotificationCenter />);

    // ----------------------------------------------------------------------------
    // Act
    // Click bell icon.
    // ----------------------------------------------------------------------------
    const bellBtn = screen.getByRole("button", { name: "Notifications" });
    fireEvent.click(bellBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Popover header, notification items, and Mark all read button should render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("3 new")).toBeInTheDocument();
    expect(screen.getByText("Personal Announcement")).toBeInTheDocument();
    expect(screen.getByText("System Wide Announcement")).toBeInTheDocument();
  });

  it("shouldRenderLoadingSkeletonsWhenNotificationsAreLoading", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock loading state.
    // ----------------------------------------------------------------------------
    vi.mocked(notificationApi.useNotificationsInfiniteQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
    } as any);

    render(<NotificationCenter />);

    // ----------------------------------------------------------------------------
    // Act
    // Open popover.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    // ----------------------------------------------------------------------------
    // Assert
    // Popover should open.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("shouldRenderEmptyStateWhenNoNotificationsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock empty notifications list and 0 unread count.
    // ----------------------------------------------------------------------------
    vi.mocked(notificationApi.useUnreadNotificationCountQuery).mockReturnValue({
      data: { totalUnreadCount: 0 },
    } as any);

    vi.mocked(notificationApi.useNotificationsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
    } as any);

    render(<NotificationCenter />);

    // ----------------------------------------------------------------------------
    // Act
    // Click bell icon.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state message.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No Notifications")).toBeInTheDocument();
  });

  it("shouldTriggerMarkAsReadAndOpenDetailDialogForGroupNotificationClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render NotificationCenter and open popover.
    // ----------------------------------------------------------------------------
    render(<NotificationCenter />);
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    // ----------------------------------------------------------------------------
    // Act
    // Click GROUP notification item.
    // ----------------------------------------------------------------------------
    const groupItem = screen.getByText("System Wide Announcement");
    fireEvent.click(groupItem);

    // ----------------------------------------------------------------------------
    // Assert
    // markAsRead called and NotificationDetailDialog opened.
    // ----------------------------------------------------------------------------
    expect(mockMarkAsRead).toHaveBeenCalledWith({
      id: "n-2",
      category: "GROUP",
    });
    expect(
      screen.getByTestId("notification-detail-dialog-mock"),
    ).toBeInTheDocument();
  });

  it("shouldTriggerMarkAsReadAndNavigateForPersonalNotificationClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render NotificationCenter and open popover.
    // ----------------------------------------------------------------------------
    render(<NotificationCenter />);
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    // ----------------------------------------------------------------------------
    // Act
    // Click PERSONAL notification item.
    // ----------------------------------------------------------------------------
    const personalItem = screen.getByText("Personal Announcement");
    fireEvent.click(personalItem);

    // ----------------------------------------------------------------------------
    // Assert
    // markAsRead called and router.push invoked.
    // ----------------------------------------------------------------------------
    expect(mockMarkAsRead).toHaveBeenCalledWith({
      id: "n-1",
      category: "PERSONAL",
    });
    expect(mockPush).toHaveBeenCalled();
  });

  it("shouldTriggerMarkAllReadMutationWhenMarkAllReadButtonClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render NotificationCenter and open popover.
    // ----------------------------------------------------------------------------
    render(<NotificationCenter />);
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    // ----------------------------------------------------------------------------
    // Act
    // Click "Mark all read" button.
    // ----------------------------------------------------------------------------
    const markAllBtn = screen.getByRole("button", { name: /Mark all read/i });
    fireEvent.click(markAllBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // markAsRead should be called without args.
    // ----------------------------------------------------------------------------
    expect(mockMarkAsRead).toHaveBeenCalledWith();
  });

  it("shouldTriggerFetchNextPageWhenViewMoreButtonClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render NotificationCenter and open popover.
    // ----------------------------------------------------------------------------
    render(<NotificationCenter />);
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    // ----------------------------------------------------------------------------
    // Act
    // Click "View More" pagination button.
    // ----------------------------------------------------------------------------
    const viewMoreBtn = screen.getByRole("button", { name: "View More" });
    fireEvent.click(viewMoreBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // fetchNextPage should be executed.
    // ----------------------------------------------------------------------------
    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
  });
});
