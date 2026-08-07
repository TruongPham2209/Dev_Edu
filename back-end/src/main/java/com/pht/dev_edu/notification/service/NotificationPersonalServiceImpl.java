package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.notification.dto.NotificationCategory;
import com.pht.dev_edu.notification.dto.NotificationResponse;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.entity.NotificationPersonalEntity;
import com.pht.dev_edu.notification.repo.NotificationPersonalRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationPersonalServiceImpl implements NotificationPersonalService {
    NotificationPersonalRepository notificationPersonalRepository;

    private static final int NOTIFICATION_PAGE_SIZE = 15;

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
    public CustomPaging<NotificationResponse> getNotifications(String username, String cursor) {
        var cursorObj = resolveCursor(cursor);
        var pageable = PageRequest.of(0, NOTIFICATION_PAGE_SIZE + 1);

        List<NotificationPersonalEntity> notifications = notificationPersonalRepository.findByUsernameWithCursor(
                username,
                cursorObj.getTimeStamp(),
                cursorObj.getId(),
                pageable);

        return PagingUtils.getPagedWithCursor(
                notifications,
                this::toNotificationResponse,
                NotificationPersonalEntity::getCreatedAt,
                NotificationPersonalEntity::getId,
                NOTIFICATION_PAGE_SIZE);
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

    private NotificationResponse toNotificationResponse(NotificationPersonalEntity entity) {
        return NotificationResponse.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .type(entity.getType())
                .title(entity.getTitle())
                .content(entity.getContent())
                .targetData(entity.getTargetData())
                .isRead(entity.getIsRead())
                .readAt(entity.getReadAt())
                .createdAt(entity.getCreatedAt())
                .category(NotificationCategory.GROUP)
                .build();
    }

    private TimeStampCursor resolveCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }
}
