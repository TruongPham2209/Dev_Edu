package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.notification.dto.NotificationResponse;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.entity.NotificationPersonalEntity;

import java.util.UUID;

public interface NotificationPersonalService {

    /**
     * Publishes a personal notification event to Kafka.
     */
    void publishNotification(PersonalNotificationEvent event);

    /**
     * Saves a personal notification received from Kafka listener into database.
     */
    NotificationPersonalEntity saveFromEvent(PersonalNotificationEvent event);

    /**
     * Gets personal notifications for a user with cursor pagination.
     */
    CustomPaging<NotificationResponse> getNotifications(String username, String cursor);

    /**
     * Gets count of unread personal notifications for a user.
     */
    long getUnreadCount(String username);

    /**
     * Marks a specific personal notification as read.
     */
    void markAsRead(UUID id, String username);

    /**
     * Marks all personal notifications as read for a user.
     */
    void markAllAsRead(String username);
}
