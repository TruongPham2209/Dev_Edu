package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.notification.dto.NotificationCategory;
import com.pht.dev_edu.notification.dto.NotificationResponse;
import com.pht.dev_edu.notification.dto.UnreadCountResponse;
import com.pht.dev_edu.notification.dto.UnifiedNotificationProjection;
import com.pht.dev_edu.notification.repo.NotificationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {

    NotificationRepository notificationRepository;
    NotificationPersonalService notificationPersonalService;
    NotificationGroupService notificationGroupService;

    private static final int NOTIFICATION_PAGE_SIZE = 15;

    @Override
    @Transactional(readOnly = true)
    public CustomPaging<NotificationResponse> getUnifiedNotifications(
            String username,
            Collection<String> userRoles,
            String cursor) {
        int limit = NOTIFICATION_PAGE_SIZE + 1;

        boolean hasRoles = !CollectionUtils.isEmpty(userRoles);
        Collection<String> safeRoles = hasRoles ? userRoles : Collections.singletonList("");

        boolean hasCursor = StringUtils.hasText(cursor);
        LocalDateTime cursorCreatedAt = null;
        UUID cursorId = null;

        if (hasCursor) {
            var decodedCursor = PagingUtils.decodeTimeStampCursor(cursor);
            cursorCreatedAt = decodedCursor.getTimeStamp();
            cursorId = decodedCursor.getId();
        }

        List<UnifiedNotificationProjection> projections = notificationRepository.findUnifiedNotificationsWithCursor(
                username,
                safeRoles,
                hasRoles,
                hasCursor,
                cursorCreatedAt,
                cursorId,
                limit);

        return PagingUtils.getPagedWithCursor(
                projections,
                this::toNotificationResponse,
                UnifiedNotificationProjection::getCreatedAt,
                UnifiedNotificationProjection::getId,
                NOTIFICATION_PAGE_SIZE);
    }

    @Override
    @Transactional(readOnly = true)
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
            // TODO: implement notification group mark all as read
        }
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
}
