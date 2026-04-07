package com.pht.dev_edu.assignment.entity;

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
@Table(name = "submission_feedback")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "submission_id", nullable = false)
    UUID submissionId;

    @Column(name = "lecturer_id", nullable = false)
    UUID lecturerId;

    @Column(nullable = false, columnDefinition = "TEXT")
    String feedback;

    @Column(name = "created_at")
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
