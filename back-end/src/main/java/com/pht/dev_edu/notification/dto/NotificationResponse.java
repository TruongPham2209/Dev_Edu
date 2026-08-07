package com.pht.dev_edu.notification.dto;

import com.pht.dev_edu.common.dto.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class NotificationResponse {
    UUID id;
    String username;
    String type;
    String title;
    String content;
    String targetData;
    Boolean isRead;
    LocalDateTime readAt;
    LocalDateTime createdAt;
    NotificationCategory category;
    String createdBy;
    List<RoleEnum> targetRoles;
}
