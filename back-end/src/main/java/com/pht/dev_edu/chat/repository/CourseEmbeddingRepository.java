package com.pht.dev_edu.chat.repository;

import com.pht.dev_edu.chat.entity.CourseEmbeddingEntity;
import com.pht.dev_edu.course.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.Modifying;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseEmbeddingRepository extends JpaRepository<CourseEmbeddingEntity, UUID> {
    Optional<CourseEmbeddingEntity> findByCourseId(UUID courseId);

    @Modifying
    @Query(value = """
            INSERT INTO course_embeddings (id, course_id, content_hash, source_text, embedding, updated_at)
            VALUES (:id, :courseId, :contentHash, :sourceText, CAST(:embedding AS vector), NOW())
            ON CONFLICT (course_id) DO UPDATE SET
                content_hash = EXCLUDED.content_hash,
                source_text = EXCLUDED.source_text,
                embedding = EXCLUDED.embedding,
                updated_at = NOW()
            """, nativeQuery = true)
    void upsertEmbedding(
            @Param("id") UUID id,
            @Param("courseId") UUID courseId,
            @Param("contentHash") String contentHash,
            @Param("sourceText") String sourceText,
            @Param("embedding") String embedding
    );

    @Query(value = """
            SELECT c.*
            FROM course_embeddings ce
            JOIN course c ON c.id = ce.course_id
            WHERE c.deleted_at IS NULL
              AND (:excludeCount = 0 OR c.id NOT IN (:excludeCourseIds))
            ORDER BY ce.embedding <=> CAST(:queryVector AS vector) ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<CourseEntity> findSimilarCourses(
            @Param("queryVector") String queryVector,
            @Param("excludeCourseIds") List<UUID> excludeCourseIds,
            @Param("excludeCount") int excludeCount,
            @Param("limit") int limit);

    @Query(value = """
            SELECT c.*
            FROM course c
            LEFT JOIN category cat ON cat.id = c.category_id
            WHERE c.deleted_at IS NULL
              AND (:excludeCount = 0 OR c.id NOT IN (:excludeCourseIds))
              AND (:category IS NULL OR LOWER(cat.name) LIKE LOWER(CONCAT('%', :category, '%')) OR LOWER(c.title) LIKE LOWER(CONCAT('%', :category, '%')))
              AND (:priceMin IS NULL OR c.price >= :priceMin)
              AND (:priceMax IS NULL OR c.price <= :priceMax)
            LIMIT :limit
            """, nativeQuery = true)
    List<CourseEntity> findFilteredCourses(
            @Param("category") String category,
            @Param("priceMin") BigDecimal priceMin,
            @Param("priceMax") BigDecimal priceMax,
            @Param("excludeCourseIds") List<UUID> excludeCourseIds,
            @Param("excludeCount") int excludeCount,
            @Param("limit") int limit);
}
