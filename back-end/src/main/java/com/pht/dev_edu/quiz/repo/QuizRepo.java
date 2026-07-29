package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.entity.QuizEntity;
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
public interface QuizRepo extends JpaRepository<QuizEntity, UUID> {
    Optional<QuizEntity> findByIdAndDeletedAtIsNull(UUID id);

    List<QuizEntity> findByCourseIdAndDeletedAtIsNull(UUID courseId);

    @Query(value = """
            SELECT *
            FROM quizzes
            WHERE   course_id           = :courseId
            AND     (created_at, id)    <= (:lastTimeStamp, :id)
            ORDER BY created_at DESC, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<QuizEntity> findByCourseIdAndDeletedAtIsNull(UUID courseId, UUID lastId, LocalDateTime lastTimestamp, int limit);

    @Query(value = """
            SELECT *
            FROM quizzes
            WHERE   status              = :status
            AND     (created_at, id)    <= (:lastTimeStamp, :id)
            ORDER BY created_at DESC, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<QuizEntity> findByStatusAndDeletedAtIsNull(QuizStatus status, UUID lastId, LocalDateTime lastTimestamp, int limit);

    Page<QuizEntity> findByCreatedByAndDeletedAtIsNull(String createdBy, Pageable pageable);
}
