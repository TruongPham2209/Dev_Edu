package com.pht.dev_edu.notification.service;

/**
 * Service for registering and unregistering Firebase Cloud Messaging (FCM) device tokens for push notifications.
 */
public interface DeviceTokenService {

    /**
     * Registers or updates an FCM device token for a user.
     *
     * @param username   the username of the user.
     * @param fcmToken   the FCM registration token of the device.
     * @param deviceType the device platform type (WEB, ANDROID, IOS).
     * @param userAgent  the browser or device User-Agent header string.
     */
    void register(String username, String fcmToken, String deviceType, String userAgent);

    /**
     * Unregisters an FCM device token when a user logs out or disables notifications.
     *
     * @param username the username of the user.
     * @param fcmToken the FCM registration token to remove.
     */
    void unregister(String username, String fcmToken);
}
