package com.pht.dev_edu.notification.service;

import java.util.Map;

public interface PushNotificationService {

    void pushToUser(String username, String title, String body, Map<String, String> data);
}
