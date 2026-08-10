package com.pht.dev_edu.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PersonalNotificationEvent {
    String username;
    NotificationEvent event;
    String title;
    String content;
    Map<NotificationTargetType, String> targetData;
}
