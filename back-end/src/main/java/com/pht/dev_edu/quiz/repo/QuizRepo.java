package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.entity.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepo extends JpaRepository<QuizEntity, UUID> {
    @Query(value = """
            SELECT *
            FROM quizzes
            WHERE   course_id           = :courseId
            AND     status              = :status
            AND     (created_at, id)    <= (:lastTimestamp, :lastId)
            ORDER BY created_at DESC, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<QuizEntity> findByCourseIdAndDeletedAtIsNull(UUID courseId, String status, UUID lastId, LocalDateTime lastTimestamp, int limit);

    @Query(value = """
            SELECT *
            FROM quizzes
            WHERE   status              = :status
            AND     (created_at, id)    <= (:lastTimestamp, :lastId)
            ORDER BY created_at DESC, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<QuizEntity> findByStatusAndDeletedAtIsNull(String status, UUID lastId, LocalDateTime lastTimestamp, int limit);
}
