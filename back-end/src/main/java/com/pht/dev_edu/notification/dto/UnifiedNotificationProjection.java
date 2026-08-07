package com.pht.dev_edu.notification.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public interface UnifiedNotificationProjection {
    UUID getId();

    String getUsername();

    String getType();

    String getTitle();

    String getContent();

    String getTargetData();

    Boolean getIsRead();

    LocalDateTime getReadAt();

    LocalDateTime getCreatedAt();

    String getCategory();

    String getCreatedBy();
}
