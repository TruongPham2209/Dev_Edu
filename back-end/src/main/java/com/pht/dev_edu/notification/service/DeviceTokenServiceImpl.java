package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.notification.entity.DeviceTokenEntity;
import com.pht.dev_edu.notification.repo.DeviceTokenRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DeviceTokenServiceImpl implements DeviceTokenService {

    DeviceTokenRepository deviceTokenRepository;

    @Override
    @Transactional
    public void register(String username, String fcmToken, String deviceType, String userAgent) {
        DeviceTokenEntity tokenEntity = deviceTokenRepository.findByFcmToken(fcmToken)
                .orElseGet(() -> DeviceTokenEntity.builder().build());

        tokenEntity.setUsername(username);
        tokenEntity.setFcmToken(fcmToken);
        tokenEntity.setDeviceType(deviceType != null && !deviceType.isBlank() ? deviceType : "web");
        tokenEntity.setUserAgent(userAgent);
        tokenEntity.setActive(true);
        tokenEntity.setLastUsedAt(LocalDateTime.now());

        deviceTokenRepository.save(tokenEntity);
        log.info("Registered FCM device token for username={}", username);
    }

    @Override
    @Transactional
    public void unregister(String username, String fcmToken) {
        int count = deviceTokenRepository.deactivateByTokenAndUsername(fcmToken, username);
        log.info("Unregistered FCM device token for username={}, deactivatedCount={}", username, count);
    }
}
