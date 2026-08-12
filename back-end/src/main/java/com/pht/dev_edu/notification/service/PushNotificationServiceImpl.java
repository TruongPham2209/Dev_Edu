package com.pht.dev_edu.notification.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.MulticastMessage;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.SendResponse;
import com.google.firebase.messaging.WebpushConfig;
import com.google.firebase.messaging.WebpushFcmOptions;
import com.pht.dev_edu.notification.entity.DeviceTokenEntity;
import com.pht.dev_edu.notification.repo.DeviceTokenRepository;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PushNotificationServiceImpl implements PushNotificationService {

    FirebaseMessaging firebaseMessaging;
    DeviceTokenRepository deviceTokenRepository;

    public PushNotificationServiceImpl(@Autowired(required = false) FirebaseMessaging firebaseMessaging,
            DeviceTokenRepository deviceTokenRepository) {
        this.firebaseMessaging = firebaseMessaging;
        this.deviceTokenRepository = deviceTokenRepository;
    }

    @Override
    public void pushToUser(String username, String title, String body, Map<String, String> data) {
        if (firebaseMessaging == null) {
            log.debug("FirebaseMessaging is not initialized. Skipping FCM push for user={}", username);
            return;
        }

        List<DeviceTokenEntity> tokens = deviceTokenRepository.findByUsernameAndActiveTrue(username);
        if (tokens.isEmpty()) {
            log.debug("No active device token found for user={}", username);
            return;
        }

        List<String> tokenStrings = tokens.stream()
                .map(DeviceTokenEntity::getFcmToken)
                .toList();

        Map<String, String> safeData = data != null ? data : Map.of();
        String link = safeData.getOrDefault("url", "/");

        MulticastMessage message = MulticastMessage.builder()
                .addAllTokens(tokenStrings)
                .setNotification(Notification.builder()
                        .setTitle(title != null ? title : "")
                        .setBody(body != null ? body : "")
                        .build())
                .putAllData(safeData)
                .setWebpushConfig(WebpushConfig.builder()
                        .setFcmOptions(WebpushFcmOptions.withLink(link))
                        .build())
                .build();

        try {
            BatchResponse response = firebaseMessaging.sendEachForMulticast(message);
            log.info("Sent FCM push to user={}, successCount={}, failureCount={}",
                    username, response.getSuccessCount(), response.getFailureCount());
            handleDeadTokens(tokens, response);
        } catch (FirebaseMessagingException e) {
            log.warn("FCM push failed for user={}: {}", username, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error pushing FCM notification for user={}: {}", username, e.getMessage(), e);
        }
    }

    @Transactional
    protected void handleDeadTokens(List<DeviceTokenEntity> tokens, BatchResponse response) {
        List<String> deadTokens = new ArrayList<>();
        List<SendResponse> responses = response.getResponses();

        for (int i = 0; i < responses.size(); i++) {
            SendResponse res = responses.get(i);
            if (!res.isSuccessful() && res.getException() != null) {
                MessagingErrorCode code = res.getException().getMessagingErrorCode();
                if (code == MessagingErrorCode.UNREGISTERED || code == MessagingErrorCode.INVALID_ARGUMENT) {
                    deadTokens.add(tokens.get(i).getFcmToken());
                }
            }
        }

        if (!deadTokens.isEmpty()) {
            log.info("Deactivating {} invalid/unregistered FCM token(s)", deadTokens.size());
            deviceTokenRepository.deactivateByTokens(deadTokens);
        }
    }
}
