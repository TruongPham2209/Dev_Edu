package com.pht.dev_edu.notification.dto;

import com.pht.dev_edu.common.dto.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CreateGroupNotificationRequest {
    String title;
    String content;
    Set<RoleEnum> targetRoles;
}
