package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "quiz_essay_gradings")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizEssayGradingEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "attempt_answer_id", nullable = false)
    UUID attemptAnswerId;

    @Column(name = "question_id", nullable = false)
    UUID questionId;

    @Column(name = "attempt_id", nullable = false)
    UUID attemptId;

    @Column(name = "grader_username", nullable = false)
    String graderUsername;

    @Column(name = "awarded_points", nullable = false, precision = 6, scale = 2)
    BigDecimal awardedPoints;

    @Column(name = "feedback", columnDefinition = "TEXT")
    String feedback;

    @Column(name = "graded_at", nullable = false)
    LocalDateTime gradedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (gradedAt == null) {
            gradedAt = LocalDateTime.now();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
