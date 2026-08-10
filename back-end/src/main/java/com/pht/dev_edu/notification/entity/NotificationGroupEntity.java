package com.pht.dev_edu.notification.entity;

import com.github.f4b6a3.uuid.UuidCreator;
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
@Table(name = "notification_group")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationGroupEntity {

    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "title", nullable = false, length = 500)
    String title;

    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    @Column(name = "type", length = 100)
    String type;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "target_data", columnDefinition = "jsonb")
    Map<NotificationTargetType, String> targetData;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
