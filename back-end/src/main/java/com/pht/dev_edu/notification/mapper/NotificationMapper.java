package com.pht.dev_edu.notification.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.notification.dto.*;
import com.pht.dev_edu.notification.entity.NotificationGroupEntity;
import com.pht.dev_edu.notification.entity.NotificationGroupTargetEntity;
import com.pht.dev_edu.notification.entity.NotificationPersonalEntity;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * MapStruct mapper for notification entities, requests, responses, and cache models.
 */
@Mapper(componentModel = "spring")
@Named("notificationMapper")
public interface NotificationMapper {

    /**
     * Maps a group creation request to a {@link NotificationGroupEntity}.
     *
     * @param request   the group notification payload.
     * @param createdBy the username creating the notification.
     * @return the mapped entity.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "targetData", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdBy", source = "createdBy")
    NotificationGroupEntity toGroupEntity(CreateGroupNotificationRequest request, String createdBy);

    /**
     * Maps group ID and role to a {@link NotificationGroupTargetEntity}.
     *
     * @param groupId the notification group ID.
     * @param role    the recipient role.
     * @return the mapped entity.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "notificationGroupId", source = "groupId")
    @Mapping(target = "role", source = "role")
    @Mapping(target = "createdAt", ignore = true)
    NotificationGroupTargetEntity toGroupTargetEntity(UUID groupId, RoleEnum role);

    /**
     * Maps a {@link NotificationGroupEntity} and target roles to a {@link NotificationResponse}.
     *
     * @param entity      the group notification entity.
     * @param targetRoles the list of recipient roles.
     * @return the notification response DTO.
     */
    @Mapping(target = "category", constant = "GROUP")
    @Mapping(target = "isRead", constant = "false")
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "readAt", ignore = true)
    @Mapping(target = "targetRoles", source = "targetRoles")
    NotificationResponse toGroupResponse(NotificationGroupEntity entity, List<RoleEnum> targetRoles);

    /**
     * Maps a {@link NotificationGroupEntity} and target roles to a {@link CachedNotification}.
     *
     * @param entity      the group notification entity.
     * @param targetRoles the list of recipient roles.
     * @return the cached notification DTO.
     */
    @Mapping(target = "category", constant = "GROUP")
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "deleteAt", source = "entity.deletedAt")
    @Mapping(target = "targetRoles", source = "targetRoles")
    CachedNotification toCached(NotificationGroupEntity entity, List<RoleEnum> targetRoles);

    /**
     * Maps a {@link NotificationPersonalEntity} to a {@link CachedNotification}.
     *
     * @param entity the personal notification entity.
     * @return the cached notification DTO.
     */
    @Mapping(target = "category", constant = "PERSONAL")
    @Mapping(target = "deleteAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "targetRoles", ignore = true)
    CachedNotification toCached(NotificationPersonalEntity entity);

    /**
     * Maps a {@link NotificationPersonalEntity} to a {@link NotificationResponse}.
     *
     * @param entity the personal notification entity.
     * @return the notification response DTO.
     */
    @Mapping(target = "category", constant = "PERSONAL")
    @Mapping(target = "targetRoles", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    NotificationResponse toResponse(NotificationPersonalEntity entity);

    /**
     * Maps a personal notification event to a {@link NotificationPersonalEntity}.
     *
     * @param event      the personal notification event.
     * @param username   the recipient username.
     * @param title      the notification title.
     * @param targetData the target data map.
     * @return the mapped entity.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", source = "event.event")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "username", source = "username")
    @Mapping(target = "content", source = "event.content")
    @Mapping(target = "targetData", source = "targetData")
    @Mapping(target = "isRead", constant = "false")
    @Mapping(target = "readAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    NotificationPersonalEntity toPersonalEntity(PersonalNotificationEvent event, String username, String title,
                                                Map<NotificationTargetType, String> targetData);

    /**
     * Maps a {@link NotificationPersonalEntity} and data map to a {@link PushNotificationEvent}.
     *
     * @param entity  the personal notification entity.
     * @param dataMap the FCM data payload.
     * @return the push notification event.
     */
    @Mapping(target = "username", source = "entity.username")
    @Mapping(target = "title", source = "entity.title")
    @Mapping(target = "body", source = "entity.content")
    @Mapping(target = "data", source = "dataMap")
    PushNotificationEvent toPushEvent(NotificationPersonalEntity entity, Map<String, String> dataMap);

    /**
     * Maps a {@link UnifiedNotificationProjection} to a {@link NotificationResponse}.
     *
     * @param projection   the unified notification projection.
     * @param objectMapper the object mapper for json parsing.
     * @return the notification response DTO.
     */
    @Mapping(target = "targetRoles", ignore = true)
    @Mapping(target = "targetData", expression = "java(parseTargetData(projection.getTargetData(), objectMapper))")
    @Mapping(target = "category", expression = "java(projection.getCategory() != null ? com.pht.dev_edu.notification.dto.NotificationCategory.valueOf(projection.getCategory()) : null)")
    NotificationResponse toResponse(UnifiedNotificationProjection projection, @Context ObjectMapper objectMapper);

    default Map<NotificationTargetType, String> parseTargetData(String rawTargetData, @Context ObjectMapper objectMapper) {
        if (!StringUtils.hasText(rawTargetData) || objectMapper == null) {
            return null;
        }
        try {
            return objectMapper.readValue(rawTargetData, new TypeReference<Map<NotificationTargetType, String>>() {});
        } catch (Exception e) {
            return null;
        }
    }
}
