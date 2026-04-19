package com.pht.dev_edu.tracking.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.tracking.dto.CronJobEvent;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "log_cronjob")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LogCronJobEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(nullable = false)
    String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    CronJobEvent.Status status;

    @Column(nullable = false, columnDefinition = "TEXT")
    String detail;

    @Column(name = "error_message", columnDefinition = "TEXT")
    String errorMessage;

    @Column(name = "error_stacktrace", columnDefinition = "TEXT")
    String errorStacktrace;

    @Column(name = "started_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "finished_at", nullable = false, updatable = false)
    LocalDateTime finishedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
    }
}
