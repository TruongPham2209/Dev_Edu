package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.notification.dto.CachedNotification;
import com.pht.dev_edu.notification.dto.NotificationCategory;
import com.pht.dev_edu.notification.dto.NotificationResponse;
import com.pht.dev_edu.notification.dto.UnreadCountResponse;

import java.util.Collection;
import java.util.UUID;

public interface NotificationService {

    /**
     * Gets unified notification feed for a user (combining personal and group
     * notifications via UNION ALL).
     */
    CustomPaging<NotificationResponse> getUnifiedNotifications(String username, Collection<String> userRoles,
            String cursor);

    /**
     * Gets unread notification counts for a user (personal, group, and total).
     */
    UnreadCountResponse getUnreadNotificationCounts(String username, Collection<String> userRoles);

    /**
     * Marks a notification (personal or group) as read for a user.
     */
    void markNotificationAsRead(UUID id, NotificationCategory category, String username);

    /**
     * Marks all notifications (personal and group) as read for a user.
     */
    void markAllNotificationsAsRead(String username, Collection<String> userRoles);

    /**
     * Get cached notification (for push notification)
     */
    CachedNotification getCachedNotification(UUID id, NotificationCategory category);

    /**
     * Delete personal notification by ID
     */
    void deleteNotification(UUID id, String username);
}
