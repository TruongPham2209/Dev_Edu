package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.dto.CategoryDetailProjection;
import com.pht.dev_edu.course.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {
    @Query(value = """
            SELECT  cat.id                          AS id,
                    cat.name                        AS name,
                    cat.description                 AS description,
                    cat.thumbnail_url               AS thumbnailUrl,
                    cat.thumbnail_object_key        AS thumbnailObjectKey,
                    COUNT(c.id)                     AS totalCourses
            FROM category cat
            LEFT JOIN course c
                ON cat.id = c.category_id
            WHERE c.deleted_at IS NULL
            GROUP BY cat.id
            """, nativeQuery = true)
    List<CategoryDetailProjection> findAllCategories();

    @Query(value = """
            SELECT  cat.id                          AS id,
                    cat.name                        AS name,
                    cat.description                 AS description,
                    cat.thumbnail_url               AS thumbnailUrl,
                    cat.thumbnail_object_key        AS thumbnailObjectKey,
                    COUNT(c.id)                     AS totalCourses
            FROM category cat
            LEFT JOIN course c
                ON cat.id = c.category_id
            WHERE   c.deleted_at    IS NULL
            AND     cat.deleted_at  IS NULL
            GROUP BY cat.id
            """, nativeQuery = true)
    List<CategoryDetailProjection> findAllByDeletedAtIsNull();

    @Query(value = """
            SELECT  cat.id                          AS id,
                    cat.name                        AS name,
                    cat.description                 AS description,
                    cat.thumbnail_url               AS thumbnailUrl,
                    cat.thumbnail_object_key        AS thumbnailObjectKey,
                    COUNT(c.id)                     AS totalCourses
            FROM category cat
            LEFT JOIN course c
                ON cat.id = c.category_id
            WHERE   c.deleted_at    IS NULL
            AND     cat.deleted_at  IS NOT NULL
            GROUP BY cat.id
            """, nativeQuery = true)
    List<CategoryDetailProjection> findAllByDeletedAtIsNotNull();

    @Modifying
    @Query(value = """
            DELETE FROM category
            WHERE   deleted_at  IS NOT NULL
            AND     deleted_at  < :cutoffTime
            RETURNING thumbnail_object_key
            """, nativeQuery = true)
    List<String> deleteCategoriesBeforeCutoffTimeThenReturnObjectKey(LocalDateTime cutoffTime);
}
