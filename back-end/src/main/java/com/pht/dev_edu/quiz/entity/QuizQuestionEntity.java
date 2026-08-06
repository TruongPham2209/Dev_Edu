package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
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
@Table(name = "quiz_questions")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizQuestionEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "quiz_id", nullable = false)
    UUID quizId;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    QuestionType questionType;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    String content;

    @Column(name = "points", nullable = false, precision = 6, scale = 2)
    BigDecimal points;

    @Column(name = "order_index", nullable = false)
    Integer orderIndex;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    String deletedBy;

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
        if (orderIndex == null) {
            orderIndex = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
