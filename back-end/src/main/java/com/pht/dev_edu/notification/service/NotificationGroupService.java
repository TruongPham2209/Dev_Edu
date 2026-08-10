package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.notification.dto.CreateGroupNotificationRequest;
import com.pht.dev_edu.notification.dto.NotificationResponse;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.UUID;

public interface NotificationGroupService {

    /**
     * Creates a group notification with target roles (Admin action).
     */
    NotificationResponse createGroupNotification(CreateGroupNotificationRequest request, String createdBy);

    /**
     * Gets all group notifications (Admin action) with cursor pagination.
     */
    CustomPaging<NotificationResponse> getAllGroupNotifications(String cursor);

    /**
     * Counts unread group notifications for a user based on user's roles.
     */
    long getUnreadGroupCountForUser(String username, Collection<String> userRoles);

    /**
     * Marks a group notification as read for a user (upsert status).
     */
    void markGroupNotificationAsRead(UUID groupId, String username);

    /**
     * Marks all group notifications as read before a given timestamp for a user.
     */
    void markAllAsReadBefore(String username, Collection<String> userRoles, LocalDateTime timestamp);

    /**
     * Soft deletes a group notification (Admin action).
     */
    void softDeleteGroupNotification(UUID groupId, String username);
}
