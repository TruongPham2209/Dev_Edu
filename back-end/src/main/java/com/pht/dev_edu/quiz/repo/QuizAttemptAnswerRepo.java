package com.pht.dev_edu.quiz.repo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.projection.QuizEssaySubmissionProjection;
import com.pht.dev_edu.quiz.entity.QuizAttemptAnswerEntity;

public interface QuizAttemptAnswerRepo extends JpaRepository<QuizAttemptAnswerEntity, UUID> {
    List<QuizAttemptAnswerEntity> findByAttemptId(UUID attemptId);

    Optional<QuizAttemptAnswerEntity> findByAttemptIdAndQuestionId(UUID attemptId, UUID questionId);

    int countByAttemptIdAndQuestionTypeAndAwardedPointsIsNull(UUID attemptId, QuestionType questionType);

    @Query(value = """
            SELECT
                aa.id                   AS attemptAnswerId,
                aa.attempt_id           AS attemptId,
                aa.question_id          AS questionId,
                att.assignment_id       AS assignmentId,
                asg.assignment_name     AS assignmentName,
                att.student_username    AS studentUsername,
                COALESCE(u.full_name, att.student_username) AS studentFullName,
                att.submitted_at        AS submittedAt,
                aa.last_saved_at        AS lastSavedAt,
                q.content               AS questionContent,
                q.points                AS maxPoints,
                aa.answer_text          AS answerText,
                aa.awarded_points       AS awardedPoints,
                eg.feedback             AS feedback,
                aa.graded_by            AS gradedBy,
                aa.graded_at            AS gradedAt,
                CASE WHEN aa.awarded_points IS NOT NULL THEN 'GRADED' ELSE 'PENDING' END AS essayStatus
            FROM quiz_attempt_answers aa
            JOIN quiz_attempts att ON aa.attempt_id = att.id
            JOIN quiz_questions q ON aa.question_id = q.id
            LEFT JOIN quiz_assignments asg ON att.assignment_id = asg.id
            LEFT JOIN "user" u ON att.student_username = u.username
            LEFT JOIN (
                SELECT DISTINCT ON (attempt_answer_id) attempt_answer_id, feedback
                FROM quiz_essay_gradings
                ORDER BY attempt_answer_id, created_at DESC
            ) eg ON aa.id = eg.attempt_answer_id
            WHERE q.quiz_id = :quizId
              AND q.question_type = 'ESSAY'
              AND att.status IN ('SUBMITTED', 'GRADING', 'GRADED')
              AND (:essayStatus = 'ALL' OR (:essayStatus = 'PENDING' AND aa.awarded_points IS NULL) OR (:essayStatus = 'GRADED' AND aa.awarded_points IS NOT NULL))
              AND (att.submitted_at, aa.id) <= (:lastTimestamp, :lastId)
            ORDER BY att.submitted_at DESC, aa.id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<QuizEssaySubmissionProjection> findEssaySubmissionsByQuizIdAndStatusAndCursor(
            @Param("quizId") UUID quizId,
            @Param("essayStatus") String essayStatus,
            @Param("lastId") UUID lastId,
            @Param("lastTimestamp") LocalDateTime lastTimestamp,
            @Param("limit") int limit);
}
