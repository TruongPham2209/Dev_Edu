package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.dto.CourseDetailProjection;
import com.pht.dev_edu.course.entity.CourseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<CourseEntity, UUID> {
    @Query(value = """
            SELECT  c.id                        AS id,
                    c.category_id               AS categoryId,
                    c.title                     AS title,
                    c.description               AS description,
                    c.thumbnail_url             AS thumbnailUrl,
                    c.thumbnail_object_key      AS thumbnailObjectKey,
                    c.created_at                AS createdAt,
                    c.created_by                AS createdBy,
                    c.price                     AS originalPrice,
            
                    cd.discount_percentage      AS discountedPercentage,
                    cd.valid_to                 AS validTo
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            WHERE   c.id            = :id
            AND     c.deleted_at    IS NULL
            """, nativeQuery = true)
    CourseDetailProjection findCourseDetail(UUID id);

    @Query(value = """
            SELECT  c.id                        AS id,
                    c.category_id               AS categoryId,
                    c.title                     AS title,
                    c.description               AS description,
                    c.thumbnail_url             AS thumbnailUrl,
                    c.thumbnail_object_key      AS thumbnailObjectKey,
                    c.created_at                AS createdAt,
                    c.created_by                AS createdBy,
                    c.price                     AS originalPrice,
            
                    cd.discount_percentage      AS discountedPercentage,
                    cd.valid_to                 AS validTo
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            WHERE   (c.created_at, c.id) < (:lastCreatedAt, :lastId)
            """, countQuery = """
            SELECT  COUNT(id)
            FROM    course
            """, nativeQuery = true)
    Page<CourseDetailProjection> findByCursor(UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  c.id                        AS id,
                    c.category_id               AS categoryId,
                    c.title                     AS title,
                    c.description               AS description,
                    c.thumbnail_url             AS thumbnailUrl,
                    c.thumbnail_object_key      AS thumbnailObjectKey,
                    c.created_at                AS createdAt,
                    c.created_by                AS createdBy,
                    c.price                     AS originalPrice,
            
                    cd.discount_percentage      AS discountedPercentage,
                    cd.valid_to                 AS validTo
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            WHERE   (c.created_at, c.id)    < (:lastCreatedAt, :lastId)
            AND     deleted_at              IS NULL
            """, countQuery = """
            SELECT  COUNT(c.id)
            FROM    course c
            WHERE   c.deleted_at IS NULL
            """, nativeQuery = true)
    Page<CourseDetailProjection> findActiveCoursesByCursor(UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  c.id                        AS id,
                    c.category_id               AS categoryId,
                    c.title                     AS title,
                    c.description               AS description,
                    c.thumbnail_url             AS thumbnailUrl,
                    c.thumbnail_object_key      AS thumbnailObjectKey,
                    c.created_at                AS createdAt,
                    c.created_by                AS createdBy,
                    c.price                     AS originalPrice,
            
                    cd.discount_percentage      AS discountedPercentage,
                    cd.valid_to                 AS validTo
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            WHERE   (c.created_at, c.id)    < (:lastCreatedAt, :lastId)
            AND     deleted_at              IS NOT NULL
            """, countQuery = """
            SELECT  COUNT(id)
            FROM    course
            WHERE   deleted_at IS NOT NULL
            """, nativeQuery = true)
    Page<CourseDetailProjection> findDeletedCoursesByCursor(UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  c.id                        AS id,
                    c.category_id               AS categoryId,
                    c.title                     AS title,
                    c.description               AS description,
                    c.thumbnail_url             AS thumbnailUrl,
                    c.thumbnail_object_key      AS thumbnailObjectKey,
                    c.created_at                AS createdAt,
                    c.created_by                AS createdBy,
                    c.price                     AS originalPrice,
            
                    cd.discount_percentage      AS discountedPercentage,
                    cd.valid_to                 AS validTo
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            WHERE   c.category_id           = :categoryId
            AND     (c.created_at, c.id)    < (:lastCreatedAt, :lastId)
            """, countQuery = """
            SELECT  COUNT(id)
            FROM    course c
            WHERE   c.category_id = :categoryId
            """, nativeQuery = true)
    Page<CourseDetailProjection> findByCategoryIdAndCursor(UUID categoryId, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  c.id                        AS id,
                    c.category_id               AS categoryId,
                    c.title                     AS title,
                    c.description               AS description,
                    c.thumbnail_url             AS thumbnailUrl,
                    c.thumbnail_object_key      AS thumbnailObjectKey,
                    c.created_at                AS createdAt,
                    c.created_by                AS createdBy,
                    c.price                     AS originalPrice,
            
                    cd.discount_percentage      AS discountedPercentage,
                    cd.valid_to                 AS validTo
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            WHERE   (c.created_at, c.id)    < (:lastCreatedAt, :lastId)
            AND     c.category_id           = :categoryId
            AND     c.deleted_at            IS NULL
            """, countQuery = """
            SELECT  COUNT(id)
            FROM    course c
            WHERE   c.category_id   = :categoryId
            AND     c.deleted_at    IS NULL
            """, nativeQuery = true)
    Page<CourseDetailProjection> findActiveCoursesByCategoryIdAndCursor(UUID categoryId, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  c.id                        AS id,
                    c.category_id               AS categoryId,
                    c.title                     AS title,
                    c.description               AS description,
                    c.thumbnail_url             AS thumbnailUrl,
                    c.thumbnail_object_key      AS thumbnailObjectKey,
                    c.created_at                AS createdAt,
                    c.created_by                AS createdBy,
                    c.price                     AS originalPrice,
            
                    cd.discount_percentage      AS discountedPercentage,
                    cd.valid_to                 AS validTo
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            WHERE   (c.created_at, c.id)    < (:lastCreatedAt, :lastId)
            AND     c.category_id           = :categoryId
            AND     c.deleted_at            IS NOT NULL
            """, countQuery = """
            SELECT  COUNT(id)
            FROM    course c
            WHERE   c.category_id   = :categoryId
            AND     c.deleted_at    IS NOT NULL
            """, nativeQuery = true)
    Page<CourseDetailProjection> findDeletedCoursesByCategoryIdAndCursor(UUID categoryId, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  c.id                        AS id,
                    c.category_id               AS categoryId,
                    c.title                     AS title,
                    c.description               AS description,
                    c.thumbnail_url             AS thumbnailUrl,
                    c.thumbnail_object_key      AS thumbnailObjectKey,
                    c.created_at                AS createdAt,
                    c.created_by                AS createdBy,
                    c.price                     AS originalPrice,
            
                    cd.discount_percentage      AS discountedPercentage,
                    cd.valid_to                 AS validTo
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            WHERE   unaccent(c.title)       ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     (c.created_at, c.id)    < (:lastCreatedAt, :lastId)
            """, countQuery = """
            SELECT  COUNT(*)
            FROM    course c
            WHERE   unaccent(c.title) ILIKE unaccent(CONCAT('%', :keyword, '%'))
            """, nativeQuery = true)
    Page<CourseDetailProjection> searchCoursesByCursor(String keyword, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  c.id                        AS id,
                    c.category_id               AS categoryId,
                    c.title                     AS title,
                    c.description               AS description,
                    c.thumbnail_url             AS thumbnailUrl,
                    c.thumbnail_object_key      AS thumbnailObjectKey,
                    c.created_at                AS createdAt,
                    c.created_by                AS createdBy,
                    c.price                     AS originalPrice,
            
                    cd.discount_percentage      AS discountedPercentage,
                    cd.valid_to                 AS validTo
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            WHERE   unaccent(c.title)       ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     (c.created_at, c.id)    < (:lastCreatedAt, :lastId)
            AND     c.deleted_at            IS NULL
            """, countQuery = """
            SELECT  COUNT(*)
            FROM    course c
            WHERE   unaccent(c.title)   ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     c.deleted_at        IS NULL
            """, nativeQuery = true)
    Page<CourseDetailProjection> searchActiveCoursesByCursor(String keyword, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  c.id                        AS id,
                    c.category_id               AS categoryId,
                    c.title                     AS title,
                    c.description               AS description,
                    c.thumbnail_url             AS thumbnailUrl,
                    c.thumbnail_object_key      AS thumbnailObjectKey,
                    c.created_at                AS createdAt,
                    c.created_by                AS createdBy,
                    c.price                     AS originalPrice,
            
                    cd.discount_percentage      AS discountedPercentage,
                    cd.valid_to                 AS validTo
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            WHERE   unaccent(c.title)       ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     (c.created_at, c.id)    < (:lastCreatedAt, :lastId)
            AND     c.deleted_at            IS NOT NULL
            """, countQuery = """
            SELECT  COUNT(*)
            FROM    course c
            WHERE   unaccent(c.title)   ILIKE unaccent(CONCAT('%', :keyword, '%'))
            AND     c.deleted_at        IS NOT NULL
            """, nativeQuery = true)
    Page<CourseDetailProjection> searchDeletedCoursesByCursor(String keyword, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    boolean existsByCategoryIdAndDeletedAtIsNull(UUID categoryId);

    @Modifying
    @Query(value = """
            DELETE FROM course
            WHERE   deleted_at  IS NOT NULL
            AND     deleted_at  < :cutoffTime
            RETURNING thumbnail_object_key
            """, nativeQuery = true)
    List<String> deleteCoursesBeforeCutoffTimeThenReturnObjectKey(LocalDateTime cutoffTime);

    @Query("SELECT c.id FROM CourseEntity c WHERE c.id IN :ids AND c.deletedAt IS NULL")
    List<UUID> findActiveIdsByIdIn(@Param("ids") List<UUID> ids);
}
