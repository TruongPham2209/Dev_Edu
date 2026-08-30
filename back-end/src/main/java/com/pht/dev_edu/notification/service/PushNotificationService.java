package com.pht.dev_edu.notification.service;

import java.util.Map;

/**
 * Service for delivering push notifications to user devices via Firebase Cloud Messaging (FCM).
 */
public interface PushNotificationService {

    /**
     * Pushes a notification to all active devices registered by the specified user.
     *
     * @param username the username of the recipient user.
     * @param title    the notification title.
     * @param body     the notification body content.
     * @param data     additional key-value payload map for client routing.
     */
    void pushToUser(String username, String title, String body, Map<String, String> data);
}
