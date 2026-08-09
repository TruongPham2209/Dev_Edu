package com.pht.dev_edu.notification.service;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.notification.dto.CreateGroupNotificationRequest;
import com.pht.dev_edu.notification.dto.NotificationCategory;
import com.pht.dev_edu.notification.dto.NotificationResponse;
import com.pht.dev_edu.notification.entity.NotificationGroupEntity;
import com.pht.dev_edu.notification.entity.NotificationGroupTargetEntity;
import com.pht.dev_edu.notification.repo.NotificationGroupReadStatusRepository;
import com.pht.dev_edu.notification.repo.NotificationGroupRepository;
import com.pht.dev_edu.notification.repo.NotificationGroupTargetRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationGroupServiceImpl implements NotificationGroupService {

    NotificationGroupRepository notificationGroupRepository;
    NotificationGroupTargetRepository notificationGroupTargetRepository;
    NotificationGroupReadStatusRepository notificationGroupReadStatusRepository;

    private static final int NOTIFICATION_PAGE_SIZE = 10;

    @Override
    @Transactional
    public NotificationResponse createGroupNotification(CreateGroupNotificationRequest request, String createdBy) {
        if (CollectionUtils.isEmpty(request.getTargetRoles())) {
            throw new BadRequestException("Target roles cannot be empty for group notification");
        }

        var groupEntity = NotificationGroupEntity.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType())
                .targetData(request.getTargetData())
                .createdBy(createdBy)
                .build();

        var savedGroup = notificationGroupRepository.save(groupEntity);

        List<NotificationGroupTargetEntity> targetEntities = request.getTargetRoles().stream()
                .map(role -> NotificationGroupTargetEntity.builder()
                        .notificationGroupId(savedGroup.getId())
                        .role(role)
                        .build())
                .toList();

        notificationGroupTargetRepository.saveAll(targetEntities);

        return NotificationResponse.builder()
                .id(savedGroup.getId())
                .title(savedGroup.getTitle())
                .content(savedGroup.getContent())
                .type(savedGroup.getType())
                .targetData(savedGroup.getTargetData())
                .createdBy(savedGroup.getCreatedBy())
                .createdAt(savedGroup.getCreatedAt())
                .category(NotificationCategory.GROUP)
                .targetRoles(new ArrayList<>(request.getTargetRoles()))
                .isRead(false)
                .build();
    }

    @Override
    public CustomPaging<NotificationResponse> getAllGroupNotifications(String cursor) {

        var decodedCursor = resolveCursor(cursor);
        List<NotificationGroupEntity> groupList = notificationGroupRepository.findActiveWithCursor(
                decodedCursor.getTimeStamp(),
                decodedCursor.getId(),
                NOTIFICATION_PAGE_SIZE + 1);

        if (groupList.isEmpty()) {
            return new CustomPaging<>();
        }

        List<UUID> groupIds = groupList.stream().map(NotificationGroupEntity::getId).toList();

        Map<UUID, List<RoleEnum>> rolesMap = notificationGroupTargetRepository
                .findByNotificationGroupIdIn(groupIds).stream()
                .collect(Collectors.groupingBy(
                        NotificationGroupTargetEntity::getNotificationGroupId,
                        Collectors.mapping(NotificationGroupTargetEntity::getRole,
                                Collectors.toList())));

        return PagingUtils.getPagedWithCursor(
                groupList,
                group -> NotificationResponse.builder()
                        .id(group.getId())
                        .title(group.getTitle())
                        .content(group.getContent())
                        .type(group.getType())
                        .targetData(group.getTargetData())
                        .createdBy(group.getCreatedBy())
                        .createdAt(group.getCreatedAt())
                        .category(NotificationCategory.GROUP)
                        .targetRoles(rolesMap.getOrDefault(group.getId(),
                                Collections.emptyList()))
                        .build(),
                NotificationGroupEntity::getCreatedAt,
                NotificationGroupEntity::getId,
                NOTIFICATION_PAGE_SIZE);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadGroupCountForUser(String username, Collection<String> userRoles) {
        if (CollectionUtils.isEmpty(userRoles)) {
            return 0;
        }
        return notificationGroupReadStatusRepository.countUnreadGroupNotificationsByRolesAndUsername(userRoles,
                username);
    }

    @Override
    @Transactional
    public void markGroupNotificationAsRead(UUID groupId, String username) {
        var group = notificationGroupRepository.findByIdAndDeletedAtIsNull(groupId)
                .orElseThrow(() -> new DataNotFoundException(
                        "Group notification not found with id: " + groupId));

        notificationGroupReadStatusRepository.upsertReadStatus(
                UuidCreator.getTimeOrderedEpoch(),
                group.getId(),
                username,
                LocalDateTime.now());
    }

    @Override
    @Transactional
    public void markAllAsReadBefore(String username, Collection<String> userRoles, LocalDateTime timestamp) {
        if (CollectionUtils.isEmpty(userRoles)) {
            return;
        }

        List<UUID> unreadGroupIds = notificationGroupReadStatusRepository
                .findUnreadGroupIdsByRolesAndTimestamp(userRoles, username, timestamp);

        if (unreadGroupIds.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        List<UUID> ids = unreadGroupIds.stream()
                .map(g -> UuidCreator.getTimeOrderedEpoch())
                .toList();

        notificationGroupReadStatusRepository.batchUpsertReadStatus(ids, unreadGroupIds, username, now);
    }

    @Override
    @Transactional
    public void softDeleteGroupNotification(UUID groupId) {
        int updated = notificationGroupRepository.softDeleteById(groupId, LocalDateTime.now());
        if (updated == 0) {
            throw new DataNotFoundException(
                    "Group notification not found or already deleted with id: " + groupId);
        }

        String cachedKey = RedisPrefixConstant.NOTIFICATION_PREFIX + NotificationCategory.GROUP + ":" + groupId;
        RedisUtils.invalidateCache(cachedKey);
    }

    private TimeStampCursor resolveCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }
}
