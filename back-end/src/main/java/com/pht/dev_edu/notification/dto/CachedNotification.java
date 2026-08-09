package com.pht.dev_edu.notification.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.pht.dev_edu.common.dto.RoleEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CachedNotification {
    UUID id;
    String username;
    String title;
    String content;
    NotificationCategory category;
    String targetData;
    LocalDateTime createdAt;
    LocalDateTime deleteAt;
    String createdBy;
    List<RoleEnum> targetRoles;
}
