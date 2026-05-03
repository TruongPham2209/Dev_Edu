package com.pht.dev_edu.tracking.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.assignment.dto.SubmissionEvent;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "submission_tracking")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmissionTrackingEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "assignment_id", nullable = false)
    UUID assignmentId;

    @Column(nullable = false)
    String actor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    SubmissionEvent.Action status;

    @Column(columnDefinition = "TEXT")
    String details;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }

        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
}
