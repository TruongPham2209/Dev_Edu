package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.notification.dto.*;
import com.pht.dev_edu.notification.repo.NotificationRepository;
import com.pht.dev_edu.user.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {
    NotificationRepository notificationRepository;

    UserService userService;
    NotificationPersonalService notificationPersonalService;
    NotificationGroupService notificationGroupService;

    private static final int NOTIFICATION_PAGE_SIZE = 15;

    @Override
    public CustomPaging<NotificationResponse> getUnifiedNotifications(
            String username,
            Collection<String> userRoles,
            String nextCursor) {
        int limit = NOTIFICATION_PAGE_SIZE + 1;

        TimeStampCursor cursor = resolveCursor(nextCursor);

        List<UnifiedNotificationProjection> projections = notificationRepository.findUnifiedNotificationsWithCursor(
                username,
                userRoles,
                cursor.getTimeStamp(),
                cursor.getId(),
                limit);

        return PagingUtils.getPagedWithCursor(
                projections,
                this::toNotificationResponse,
                UnifiedNotificationProjection::getCreatedAt,
                UnifiedNotificationProjection::getId,
                NOTIFICATION_PAGE_SIZE);
    }

    @Override
    public UnreadCountResponse getUnreadNotificationCounts(String username, Collection<String> userRoles) {
        long personalUnread = notificationPersonalService.getUnreadCount(username);
        long groupUnread = notificationGroupService.getUnreadGroupCountForUser(username, userRoles);

        return UnreadCountResponse.builder()
                .personalUnreadCount(personalUnread)
                .groupUnreadCount(groupUnread)
                .totalUnreadCount(personalUnread + groupUnread)
                .build();
    }

    @Override
    @Transactional
    public void markNotificationAsRead(UUID id, NotificationCategory category, String username) {
        if (category == NotificationCategory.GROUP) {
            notificationGroupService.markGroupNotificationAsRead(id, username);
        } else {
            notificationPersonalService.markAsRead(id, username);
        }
    }

    @Override
    @Transactional
    public void markAllNotificationsAsRead(String username, Collection<String> userRoles) {
        notificationPersonalService.markAllAsRead(username);

        if (!CollectionUtils.isEmpty(userRoles)) {
            var user = userService.findByUsername(username);
            var userCreatedAt = user.getCreatedAt();

            notificationGroupService.markAllAsReadBefore(username, userRoles, userCreatedAt);
        }
    }

    @Override
    public CachedNotification getCachedNotification(UUID id, NotificationCategory category) {
        String cachedKey = RedisPrefixConstant.NOTIFICATION_PREFIX + category + ":" + id;
        return RedisUtils.getDataFromCacheOrDb(
                cachedKey,
                CachedNotification.class,
                () -> getNotificationFromDb(id, category),
                RedisDurationConstant.NOTIFICATION_DATA_DURATION);
    }

    private CachedNotification getNotificationFromDb(UUID id, NotificationCategory category) {
        if (category == null) {
            throw new BadRequestException("Category is null");
        }

        if (category == NotificationCategory.GROUP) {

        }

        return null;
    }

    private NotificationResponse toNotificationResponse(UnifiedNotificationProjection proj) {
        return NotificationResponse.builder()
                .id(proj.getId())
                .username(proj.getUsername())
                .type(proj.getType())
                .title(proj.getTitle())
                .content(proj.getContent())
                .targetData(proj.getTargetData())
                .isRead(proj.getIsRead())
                .readAt(proj.getReadAt())
                .createdAt(proj.getCreatedAt())
                .category(NotificationCategory.valueOf(proj.getCategory()))
                .createdBy(proj.getCreatedBy())
                .build();
    }

    private TimeStampCursor resolveCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }
}
