package com.pht.dev_edu.notification.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.dto.RoleEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "notification_group_target")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationGroupTargetEntity {

    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "notification_group_id", nullable = false)
    UUID notificationGroupId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    RoleEnum role;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
