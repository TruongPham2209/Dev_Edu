package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "quiz_attempt_answer_logs")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAttemptAnswerLogEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "attempt_id", nullable = false)
    UUID attemptId;

    @Column(name = "question_id", nullable = false)
    UUID questionId;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    String answerText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_option_ids", columnDefinition = "jsonb")
    String selectedOptionIds;

    @Column(name = "client_seq", nullable = false)
    Integer clientSeq;

    @Column(name = "session_token", nullable = false)
    String sessionToken;

    @Column(name = "saved_at", nullable = false)
    LocalDateTime savedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (savedAt == null) {
            savedAt = LocalDateTime.now();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
