package com.pht.dev_edu.notification.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.notification.dto.NotificationEvent;
import com.pht.dev_edu.notification.dto.NotificationTargetType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "notification_personal")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationPersonalEntity {

    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "username", nullable = false)
    String username;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 100)
    NotificationEvent type;

    @Column(name = "title", nullable = false, length = 500)
    String title;

    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "target_data", columnDefinition = "jsonb")
    Map<NotificationTargetType, String> targetData;

    @Column(name = "is_read", nullable = false)
    Boolean isRead;

    @Column(name = "read_at")
    LocalDateTime readAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
}
