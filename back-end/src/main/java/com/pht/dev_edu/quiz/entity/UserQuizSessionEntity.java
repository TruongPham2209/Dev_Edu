package com.pht.dev_edu.quiz.entity;

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
@Table(name = "user_quiz_sessions")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserQuizSessionEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "username", nullable = false)
    String username;

    @Column(name = "session_token", nullable = false, unique = true)
    String sessionToken;

    @Column(name = "device_info", columnDefinition = "TEXT")
    String deviceInfo;

    @Column(name = "ip_address")
    String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    String userAgent;

    @Column(name = "is_active", nullable = false)
    Boolean isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "last_active_at", nullable = false)
    LocalDateTime lastActiveAt;

    @Column(name = "expires_at", nullable = false)
    LocalDateTime expiresAt;

    @Column(name = "revoked_at")
    LocalDateTime revokedAt;

    @Column(name = "revoked_reason")
    String revokedReason;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (lastActiveAt == null) {
            lastActiveAt = LocalDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
    }
}
