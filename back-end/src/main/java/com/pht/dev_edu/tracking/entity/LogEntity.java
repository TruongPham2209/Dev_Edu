package com.pht.dev_edu.tracking.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "log_tracking")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LogEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(nullable = false)
    String username;

    @Column(name = "aggregate_id", nullable = false)
    UUID aggregateId;

    String action;

    @Column(columnDefinition = "TEXT")
    String details;

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
