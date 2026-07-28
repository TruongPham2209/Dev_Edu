package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.ScoringMethod;
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
@Table(name = "quiz_question_type_configs", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"quiz_id", "question_type"})
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizQuestionTypeConfigEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "quiz_id", nullable = false)
    UUID quizId;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    QuestionType questionType;

    @Column(name = "required_count", nullable = false)
    Integer requiredCount;

    @Column(name = "points_per_question", nullable = false, precision = 6, scale = 2)
    BigDecimal pointsPerQuestion;

    @Enumerated(EnumType.STRING)
    @Column(name = "scoring_method", nullable = false)
    ScoringMethod scoringMethod;

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
        if (requiredCount == null) {
            requiredCount = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
