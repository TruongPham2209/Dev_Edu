package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.DocumentStatus;
import com.pht.dev_edu.quiz.dto.enums.DocumentVisibility;
import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseDocumentRepository extends JpaRepository<CourseDocumentEntity, UUID> {
    List<CourseDocumentEntity> findByVisibilityAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            DocumentVisibility visibility,
            DocumentStatus status
    );

    Optional<CourseDocumentEntity> findByIdAndDeletedAtIsNull(UUID id);

    Optional<CourseDocumentEntity> findByContentHashAndVisibilityAndDeletedAtIsNull(
            String contentHash,
            DocumentVisibility visibility
    );

    @Query(value = """
            SELECT d.*
            FROM course_documents d
            WHERE d.visibility = 'GLOBAL'
              AND d.status = 'READY'
              AND d.deleted_at IS NULL
              AND (:fileName IS NULL OR LOWER(d.file_name) LIKE LOWER(CONCAT('%', :fileName, '%')) OR LOWER(d.title) LIKE LOWER(CONCAT('%', :fileName, '%')))
              AND (
                  CAST(:cursorTime AS TIMESTAMP) IS NULL
                  OR d.created_at < :cursorTime
                  OR (d.created_at = :cursorTime AND d.id < :cursorId)
              )
            ORDER BY d.created_at DESC, d.id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<CourseDocumentEntity> findGlobalDocumentsWithCursor(
            @Param("fileName") String fileName,
            @Param("cursorTime") LocalDateTime cursorTime,
            @Param("cursorId") UUID cursorId,
            @Param("limit") int limit
    );
}
