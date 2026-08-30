package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;

import java.util.UUID;

/**
 * Service for managing user-specific personal notifications.
 */
public interface NotificationPersonalService {

    /**
     * Publishes a personal notification event to Kafka for asynchronous handling.
     *
     * @param event the {@link PersonalNotificationEvent} containing notification payload.
     */
    void publishNotification(PersonalNotificationEvent event);

    /**
     * Persists a personal notification received from the Kafka listener into the database.
     *
     * @param event the {@link PersonalNotificationEvent} payload.
     */
    void saveFromEvent(PersonalNotificationEvent event);

    /**
     * Gets the count of unread personal notifications for a user.
     *
     * @param username the username of the user.
     * @return the count of unread personal notifications.
     */
    long getUnreadCount(String username);

    /**
     * Marks a specific personal notification as read.
     *
     * @param id       the UUID of the personal notification.
     * @param username the username of the notification owner.
     */
    void markAsRead(UUID id, String username);

    /**
     * Marks all personal notifications as read for a user.
     *
     * @param username the username of the user.
     */
    void markAllAsRead(String username);
}
