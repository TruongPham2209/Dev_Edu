package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.entity.CourseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<CourseEntity, UUID> {
    Page<CourseEntity> findByCategoryIdAndDeletedAtIsNull(UUID categoryId, Pageable pageable);

    Page<CourseEntity> findByCategoryIdAndDeletedAtIsNotNull(UUID categoryId, Pageable pageable);

    Page<CourseEntity> findByCategoryId(UUID categoryId, Pageable pageable);

    Page<CourseEntity> findByDeletedAtIsNull(Pageable pageable);

    Page<CourseEntity> findByDeletedAtIsNotNull(Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course
            WHERE   (c.created_at, c.id) < (:lastCreatedAt, :lastId)
            """, countQuery = """
            SELECT  COUNT(id)
            FROM    course
            """, nativeQuery = true)
    Page<CourseEntity> findByCursor(UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course
            WHERE   (c.created_at, c.id) < (:lastCreatedAt, :lastId)
            AND     deleted_at IS NULL
            """, countQuery = """
            SELECT  COUNT(c.id)
            FROM    course c
            WHERE   c.deleted_at IS NULL
            """, nativeQuery = true)
    Page<CourseEntity> findActiveCoursesByCursor(UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course
            WHERE   (c.created_at, c.id) < (:lastCreatedAt, :lastId)
            AND     deleted_at IS NOT NULL
            """, countQuery = """
            SELECT  COUNT(id)
            FROM    course
            WHERE   deleted_at IS NOT NULL
            """, nativeQuery = true)
    Page<CourseEntity> findDeletedCoursesByCursor(UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course
            WHERE   c.category_id = :categoryId
            AND     (c.created_at, c.id) < (:lastCreatedAt, :lastId)
            """, countQuery = """
            SELECT  COUNT(id)
            FROM    course
            WHERE   c.category_id = :categoryId
            """, nativeQuery = true)
    Page<CourseEntity> findByCategoryIdAndCursor(UUID categoryId, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course
            WHERE   (c.created_at, c.id) < (:lastCreatedAt, :lastId)
            AND     c.categoryId = :categoryId
            AND     c.deletedAt IS NULL
            """, countQuery = """
            SELECT  COUNT(id)
            FROM    course
            WHERE   c.category_id = :categoryId
            AND     c.deleted_at IS NULL
            """, nativeQuery = true)
    Page<CourseEntity> findActiveCoursesByCategoryIdAndCursor(UUID categoryId, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course
            WHERE   (c.created_at, c.id) < (:lastCreatedAt, :lastId)
            AND     c.categoryId = :categoryId
            AND     c.deletedAt IS NOT NULL
            """, countQuery = """
            SELECT  COUNT(id)
            FROM    course
            WHERE   c.category_id = :categoryId
            AND     c.deleted_at IS NOT NULL
            """, nativeQuery = true)
    Page<CourseEntity> findDeletedCoursesByCategoryIdAndCursor(UUID categoryId, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
                    SELECT  *
                    FROM    course c
                    WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            """, nativeQuery = true)
    Page<CourseEntity> searchCourses(String keyword, Pageable pageable);

    @Query(value = """
                    SELECT  *
                    FROM    course c
                    WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
                    AND     c.deleted_at IS NULL
            """, nativeQuery = true)
    Page<CourseEntity> searchActiveCourses(String keyword, Pageable pageable);

    @Query(value = """
                    SELECT  *
                    FROM    course c
                    WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
                    AND     c.deleted_at IS NOT NULL
            """, nativeQuery = true)
    Page<CourseEntity> searchDeletedCourses(String keyword, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     (c.created_at, c.id) < (:lastCreatedAt, :lastId)
            """, countQuery = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            """, nativeQuery = true)
    Page<CourseEntity> searchCoursesByCursor(String keyword, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     (c.created_at, c.id) < (:lastCreatedAt, :lastId)
            AND     c.deleted_at IS NULL
            """, countQuery = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     c.deleted_at IS NULL
            """, nativeQuery = true)
    Page<CourseEntity> searchActiveCoursesByCursor(String keyword, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     (c.created_at, c.id) < (:lastCreatedAt, :lastId)
            AND     c.deleted_at IS NOT NULL
            """, countQuery = """
            SELECT  *
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     c.deleted_at IS NOT NULL
            """, nativeQuery = true)
    Page<CourseEntity> searchDeletedCoursesByCursor(String keyword, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    boolean existsByCategoryIdAndDeletedAtIsNull(UUID categoryId);

    @Modifying
    @Query(value = """
            DELETE FROM course
            WHERE deleted_at IS NOT NULL
            AND deleted_at < :cutoffTime
            RETURNING thumbnail_object_key
            """, nativeQuery = true)
    List<String> deleteCoursesBeforeCutoffTimeAndReturnObjectKey(LocalDateTime cutoffTime);
}
