package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.AssignmentStatus;
import com.pht.dev_edu.quiz.entity.QuizAssignmentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
            )   AND deleted_at IS NULL
            """, nativeQuery = true)
    List<QuizAssignmentEntity> findByCourseIdAndDeletedAtIsNull(UUID courseId);

    Page<QuizAssignmentEntity> findByQuizIdAndDeletedAtIsNull(UUID quizId, Pageable pageable);

    boolean existsByQuizIdAndDeletedAtIsNull(UUID quizId);

    List<QuizAssignmentEntity> findByStatusAndStartTimeLessThanEqualAndDeletedAtIsNull(AssignmentStatus status, LocalDateTime time);

    List<QuizAssignmentEntity> findByStatusAndEndTimeNotNullAndEndTimeLessThanEqualAndDeletedAtIsNull(AssignmentStatus status, LocalDateTime time);
}
