package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "quiz_attempt_answers", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"attempt_id", "question_id"})
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAttemptAnswerEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "attempt_id", nullable = false)
    UUID attemptId;

    @Column(name = "question_id", nullable = false)
    UUID questionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    QuestionType questionType;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    String answerText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_option_ids", columnDefinition = "jsonb")
    String selectedOptionIds;

    @Column(name = "is_correct")
    Boolean isCorrect;

    @Column(name = "awarded_points", precision = 6, scale = 2)
    BigDecimal awardedPoints;

    @Column(name = "graded_by")
    String gradedBy;

    @Column(name = "graded_at")
    LocalDateTime gradedAt;

    @Column(name = "autosave_version", nullable = false)
    Integer autosaveVersion;

    @Column(name = "last_saved_at", nullable = false)
    LocalDateTime lastSavedAt;

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
        if (lastSavedAt == null) {
            lastSavedAt = LocalDateTime.now();
        }
        if (autosaveVersion == null) {
            autosaveVersion = 1;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
