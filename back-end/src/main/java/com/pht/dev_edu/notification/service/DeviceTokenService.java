package com.pht.dev_edu.notification.service;

public interface DeviceTokenService {

    void register(String username, String fcmToken, String deviceType, String userAgent);

    void unregister(String username, String fcmToken);
}
