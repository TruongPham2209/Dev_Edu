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
@Table(name = "quiz_question_options")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizQuestionOptionEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "question_id", nullable = false)
    UUID questionId;

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    String optionText;

    @Column(name = "is_correct", nullable = false)
    Boolean isCorrect;

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
        if (isCorrect == null) {
            isCorrect = false;
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
