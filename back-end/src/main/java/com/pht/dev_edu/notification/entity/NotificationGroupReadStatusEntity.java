package com.pht.dev_edu.notification.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(
        name = "notification_group_read_status",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_notification_group_read_status_username_group",
                        columnNames = {"username", "notification_group_id"}
                )
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationGroupReadStatusEntity {

    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "notification_group_id", nullable = false)
    UUID notificationGroupId;

    @Column(name = "username", nullable = false)
    String username;

    @Column(name = "is_read", nullable = false)
    Boolean isRead;

    @Column(name = "read_at", nullable = false)
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
        if (readAt == null) {
            readAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
