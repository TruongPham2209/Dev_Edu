package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.AssignmentStatus;
import com.pht.dev_edu.quiz.entity.QuizAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAssignmentRepo extends JpaRepository<QuizAssignmentEntity, UUID> {
    Optional<QuizAssignmentEntity> findByIdAndDeletedAtIsNull(UUID id);

    List<QuizAssignmentEntity> findByQuizIdAndDeletedAtIsNull(UUID quizId);

    @Query(value = """
            SELECT *
            FROM quiz_assignments
            WHERE quiz_id IN (
                SELECT id
                FROM quizzes
                WHERE course_id = :courseId
            )
            AND deleted_at  IS NULL
            AND end_time    >= :startTime
            AND status      IN :statuses
            """, nativeQuery = true)
    List<QuizAssignmentEntity> findByCourseIdAndDeletedAtIsNullAndStartTimeAndStatuses(UUID courseId, LocalDateTime startTime, List<String> statuses);

    boolean existsByQuizIdAndDeletedAtIsNull(UUID quizId);

    List<QuizAssignmentEntity> findByStatusAndStartTimeLessThanEqualAndDeletedAtIsNull(AssignmentStatus status, LocalDateTime time);

    List<QuizAssignmentEntity> findByStatusAndEndTimeNotNullAndEndTimeLessThanEqualAndDeletedAtIsNull(AssignmentStatus status, LocalDateTime time);

    @Query("""
            SELECT  COUNT(a) > 0
            FROM    QuizAssignmentEntity a
            WHERE   a.quizId        = :quizId
            AND     a.deletedAt     IS NULL
            AND     (CAST(:endTime AS timestamp) IS NULL OR a.startTime < :endTime)
            AND     (a.endTime IS NULL OR a.endTime > :startTime)
            """)
    boolean existsOverlappingAssignment(
            @Param("quizId") UUID quizId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
