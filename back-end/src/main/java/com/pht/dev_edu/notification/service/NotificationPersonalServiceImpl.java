package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.entity.NotificationPersonalEntity;
import com.pht.dev_edu.notification.repo.NotificationPersonalRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationPersonalServiceImpl implements NotificationPersonalService {
    NotificationPersonalRepository notificationPersonalRepository;

    @Override
    public void publishNotification(PersonalNotificationEvent event) {
        log.info("Publishing personal notification event to Kafka for user: {}", event.getUsername());
        KafkaUtils.sendPersonalNotificationEvent(event);
    }

    @Override
    @Transactional
    public NotificationPersonalEntity saveFromEvent(PersonalNotificationEvent event) {
        log.info("Saving personal notification to DB for user: {}", event.getUsername());
        var entity = NotificationPersonalEntity.builder()
                .username(event.getUsername())
                .type(event.getType())
                .title(event.getTitle())
                .content(event.getContent())
                .targetData(event.getTargetData())
                .isRead(false)
                .build();
        notificationPersonalRepository.save(entity);

        // TODO: push notification
        return entity;
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        return notificationPersonalRepository.countByUsernameAndIsReadFalse(username);
    }

    @Override
    @Transactional
    public void markAsRead(UUID id, String username) {
        var notification = notificationPersonalRepository.findByIdAndUsername(id, username)
                .orElseThrow(() -> new DataNotFoundException("Personal notification not found with id: " + id));

        if (Boolean.FALSE.equals(notification.getIsRead())) {
            notificationPersonalRepository.markAsReadByIdAndUsername(id, username, LocalDateTime.now());
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(String username) {
        notificationPersonalRepository.markAllAsReadByUsername(username, LocalDateTime.now());
    }
}
