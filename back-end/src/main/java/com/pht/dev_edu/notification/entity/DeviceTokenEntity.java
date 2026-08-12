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
@Table(name = "device_tokens")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DeviceTokenEntity {

    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "username", nullable = false, length = 100)
    String username;

    @Column(name = "fcm_token", nullable = false, unique = true, columnDefinition = "TEXT")
    String fcmToken;

    @Builder.Default
    @Column(name = "device_type", nullable = false, length = 20)
    String deviceType = "web";

    @Column(name = "user_agent", columnDefinition = "TEXT")
    String userAgent;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean active = true;

    @Column(name = "last_used_at")
    LocalDateTime lastUsedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (lastUsedAt == null) {
            lastUsedAt = LocalDateTime.now();
        }
        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
