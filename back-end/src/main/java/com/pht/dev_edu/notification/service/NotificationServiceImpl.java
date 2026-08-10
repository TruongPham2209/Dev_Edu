package com.pht.dev_edu.notification.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.notification.dto.*;
import com.pht.dev_edu.notification.entity.NotificationGroupTargetEntity;
import com.pht.dev_edu.notification.repo.NotificationGroupRepository;
import com.pht.dev_edu.notification.repo.NotificationGroupTargetRepository;
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
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {
    NotificationRepository notificationRepository;
    NotificationGroupRepository notificationGroupRepository;
    NotificationGroupTargetRepository notificationGroupTargetRepository;

    UserService userService;
    NotificationPersonalService notificationPersonalService;
    NotificationGroupService notificationGroupService;

    ObjectMapper objectMapper;

    private static final int NOTIFICATION_PAGE_SIZE = 15;

    @Override
    public CustomPaging<NotificationResponse> getUnifiedNotifications(
            String username,
            Collection<String> userRoles,
            String nextCursor) {
        int limit = NOTIFICATION_PAGE_SIZE + 1;

        TimeStampCursor cursor = resolveCursor(nextCursor);

        Set<RoleEnum> roleEnums = SecurityContextUtils.extractRoleEnums(userRoles);
        List<String> roleNames = roleEnums.stream().map(RoleEnum::name).toList();
        if (roleNames.isEmpty()) {
            roleNames = List.of(RoleEnum.STUDENT.name());
        }

        List<UnifiedNotificationProjection> projections = notificationRepository.findUnifiedNotificationsWithCursor(
                username,
                roleNames,
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

        String cachedKey = RedisPrefixConstant.NOTIFICATION_PREFIX + category + ":" + id;
        RedisUtils.invalidateCache(cachedKey);
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

    @Override
    public void deleteNotification(UUID id, String username) {
        var notification = notificationRepository.findById(id).orElseThrow(
                () -> new DataNotFoundException("Notification not found"));
        if (!notification.getUsername().equals(username)) {
            throw new BadRequestException("You do not have permission to delete this notification");
        }
        notificationRepository.delete(notification);

        String cachedKey = RedisPrefixConstant.NOTIFICATION_PREFIX + NotificationCategory.PERSONAL + ":" + id;
        RedisUtils.invalidateCache(cachedKey);
    }

    private CachedNotification getNotificationFromDb(UUID id, NotificationCategory category) {
        if (category == null) {
            throw new BadRequestException("Category is null");
        }

        if (category == NotificationCategory.GROUP) {
            var groupEntity = notificationGroupRepository.findById(id)
                    .orElseThrow(() -> new DataNotFoundException("Group notification not found with id: " + id));

            List<RoleEnum> targetRoles = notificationGroupTargetRepository
                    .findByNotificationGroupIdIn(List.of(id))
                    .stream()
                    .map(NotificationGroupTargetEntity::getRole)
                    .toList();

            return CachedNotification.builder()
                    .id(groupEntity.getId())
                    .title(groupEntity.getTitle())
                    .content(groupEntity.getContent())
                    .category(NotificationCategory.GROUP)
                    .targetData(groupEntity.getTargetData())
                    .createdAt(groupEntity.getCreatedAt())
                    .deleteAt(groupEntity.getDeletedAt())
                    .createdBy(groupEntity.getCreatedBy())
                    .targetRoles(targetRoles)
                    .build();
        }

        var personalEntity = notificationRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Personal notification not found with id: " + id));

        return CachedNotification.builder()
                .id(personalEntity.getId())
                .username(personalEntity.getUsername())
                .title(personalEntity.getTitle())
                .content(personalEntity.getContent())
                .category(NotificationCategory.PERSONAL)
                .targetData(personalEntity.getTargetData())
                .createdAt(personalEntity.getCreatedAt())
                .build();
    }

    private NotificationResponse toNotificationResponse(UnifiedNotificationProjection proj) {
        return NotificationResponse.builder()
                .id(proj.getId())
                .username(proj.getUsername())
                .type(proj.getType())
                .title(proj.getTitle())
                .content(proj.getContent())
                .targetData(parseTargetData(proj.getTargetData()))
                .isRead(proj.getIsRead())
                .readAt(proj.getReadAt())
                .createdAt(proj.getCreatedAt())
                .category(NotificationCategory.valueOf(proj.getCategory()))
                .createdBy(proj.getCreatedBy())
                .build();
    }

    private Map<NotificationTargetType, String> parseTargetData(String rawTargetData) {
        if (!StringUtils.hasText(rawTargetData)) {
            return null;
        }
        try {
            return objectMapper.readValue(rawTargetData, new TypeReference<Map<NotificationTargetType, String>>() {});
        } catch (Exception e) {
            log.error("Failed to parse targetData JSON: {}", rawTargetData, e);
            return null;
        }
    }

    private TimeStampCursor resolveCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }
}
