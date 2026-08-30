package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.notification.dto.CreateGroupNotificationRequest;
import com.pht.dev_edu.notification.dto.NotificationResponse;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.UUID;

/**
 * Service for managing group / role-targeted system notifications.
 */
public interface NotificationGroupService {

    /**
     * Creates a group notification targeting specific roles (Admin action).
     *
     * @param request   the {@link CreateGroupNotificationRequest} containing title, message, event type, and target roles.
     * @param createdBy the username of the administrator creating the notification.
     * @return the created {@link NotificationResponse}.
     */
    NotificationResponse createGroupNotification(CreateGroupNotificationRequest request, String createdBy);

    /**
     * Retrieves all group notifications with cursor-based pagination (Admin action).
     *
     * @param cursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link NotificationResponse} items.
     */
    CustomPaging<NotificationResponse> getAllGroupNotifications(String cursor);

    /**
     * Counts unread group notifications for a user based on their active roles.
     *
     * @param username  the username of the user.
     * @param userRoles the collection of user role names.
     * @return the count of unread group notifications.
     */
    long getUnreadGroupCountForUser(String username, Collection<String> userRoles);

    /**
     * Marks a specific group notification as read for a user.
     *
     * @param groupId  the UUID of the group notification.
     * @param username the username of the user.
     */
    void markGroupNotificationAsRead(UUID groupId, String username);

    /**
     * Marks all group notifications created before a specified timestamp as read for a user.
     *
     * @param username  the username of the user.
     * @param userRoles the collection of user role names.
     * @param timestamp the cutoff timestamp.
     */
    void markAllAsReadBefore(String username, Collection<String> userRoles, LocalDateTime timestamp);

    /**
     * Soft-deletes a group notification from the system (Admin action).
     *
     * @param groupId  the UUID of the group notification to delete.
     * @param username the username of the administrator requesting deletion.
     */
    void softDeleteGroupNotification(UUID groupId, String username);
}
