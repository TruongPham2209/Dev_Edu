package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.notification.dto.CreateGroupNotificationRequest;
import com.pht.dev_edu.notification.dto.NotificationResponse;

import java.util.Collection;
import java.util.UUID;

public interface NotificationGroupService {

    /**
     * Creates a group notification with target roles (Admin action).
     */
    NotificationResponse createGroupNotification(CreateGroupNotificationRequest request, String createdBy);

    /**
     * Gets group notifications for a user based on user's roles with cursor
     * pagination.
     */
    CustomPaging<NotificationResponse> getGroupNotificationsForUser(String username, Collection<String> userRoles,
            String cursor);

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
     * Soft deletes a group notification (Admin action).
     */
    void softDeleteGroupNotification(UUID groupId);
}
