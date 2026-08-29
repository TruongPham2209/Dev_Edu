package com.pht.dev_edu.quiz.repo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.pht.dev_edu.quiz.entity.QuizEntity;

public interface QuizRepo extends JpaRepository<QuizEntity, UUID> {
        @Query(value = """
                        SELECT *
                        FROM quizzes
                        WHERE   course_id           = :courseId
                        AND     status              = :status
                        AND     (created_at, id)    <= (:lastTimestamp, :lastId)
                        AND     (:keyword IS NULL OR :keyword = '' OR immutable_unaccent(title) ILIKE immutable_unaccent(CONCAT('%', :keyword, '%')))
                        AND     deleted_at          IS NULL
                        ORDER BY created_at DESC, id DESC
                        LIMIT :limit
                        """, nativeQuery = true)
        List<QuizEntity> findByCourseIdAndDeletedAtIsNull(UUID courseId, String status, String keyword, UUID lastId,
                        LocalDateTime lastTimestamp, int limit);

        @Query(value = """
                        SELECT *
                        FROM quizzes
                        WHERE   status              = :status
                        AND     (:keyword IS NULL OR :keyword = '' OR immutable_unaccent(title) ILIKE immutable_unaccent(CONCAT('%', :keyword, '%')))
                        AND     deleted_at          IS NULL
                        AND     (created_at, id)    <= (:lastTimestamp, :lastId)
                        ORDER BY created_at DESC, id DESC
                        LIMIT :limit
                        """, nativeQuery = true)
        List<QuizEntity> findByStatusAndDeletedAtIsNull(String status, String keyword, UUID lastId, LocalDateTime lastTimestamp,
                        int limit);
}
