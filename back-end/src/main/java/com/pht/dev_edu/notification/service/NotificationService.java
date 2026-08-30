package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.notification.dto.CachedNotification;
import com.pht.dev_edu.notification.dto.NotificationCategory;
import com.pht.dev_edu.notification.dto.NotificationResponse;
import com.pht.dev_edu.notification.dto.UnreadCountResponse;

import java.util.Collection;
import java.util.UUID;

/**
 * Unified notification service combining personal and group notification feeds for users.
 */
public interface NotificationService {

    /**
     * Retrieves unified notification feed for a user (combining personal and group notifications) with cursor pagination.
     *
     * @param username  the username of the user.
     * @param userRoles the collection of user role names.
     * @param cursor    the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link NotificationResponse} items.
     */
    CustomPaging<NotificationResponse> getUnifiedNotifications(String username, Collection<String> userRoles,
            String cursor);

    /**
     * Retrieves unread notification counts for a user (personal, group, and total).
     *
     * @param username  the username of the user.
     * @param userRoles the collection of user role names.
     * @return the {@link UnreadCountResponse} containing categorized unread counts.
     */
    UnreadCountResponse getUnreadNotificationCounts(String username, Collection<String> userRoles);

    /**
     * Marks a notification (personal or group) as read for a user.
     *
     * @param id       the UUID of the notification.
     * @param category the {@link NotificationCategory} (PERSONAL or GROUP).
     * @param username the username of the user.
     */
    void markNotificationAsRead(UUID id, NotificationCategory category, String username);

    /**
     * Marks all notifications (both personal and group) as read for a user.
     *
     * @param username  the username of the user.
     * @param userRoles the collection of user role names.
     */
    void markAllNotificationsAsRead(String username, Collection<String> userRoles);

    /**
     * Retrieves a cached notification by ID (used for push notification dispatching).
     *
     * @param id       the UUID of the notification.
     * @param category the {@link NotificationCategory}.
     * @return the {@link CachedNotification}.
     */
    CachedNotification getCachedNotification(UUID id, NotificationCategory category);

    /**
     * Deletes a personal notification by ID.
     *
     * @param id       the UUID of the personal notification to delete.
     * @param username the username of the notification owner.
     */
    void deleteNotification(UUID id, String username);
}
