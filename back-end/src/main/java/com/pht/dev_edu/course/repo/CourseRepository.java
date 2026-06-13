package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.dto.CourseDetailProjection;
import com.pht.dev_edu.course.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<CourseEntity, UUID> {
    @Query(value = """
            SELECT  c.id                                AS id,
                    c.category_id                       AS categoryId,
                    c.title                             AS title,
                    c.description                       AS description,
                    c.thumbnail_url                     AS thumbnailUrl,
                    c.thumbnail_object_key              AS thumbnailObjectKey,
                    c.created_at                        AS createdAt,
                    c.created_by                        AS createdBy,
                    c.price                             AS originalPrice,
            
                    cd.discount_percentage              AS discountedPercentage,
                    cd.valid_to                         AS validTo,
            
                    EXISTS (
                        SELECT 1
                        FROM enrollment en
                        WHERE   en.course_id = :id
                        AND     en.student_username = :username
                    )                                   AS registered,
            
                    COALESCE(e.total_enrollment, 0)     AS totalEnrollment,
                    COALESCE(r.total_review, 0)         AS totalReview,
                    COALESCE(r.avg_review, 0)           AS avgReview
            FROM    course c
            LEFT JOIN course_discount cd
                ON c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)    AS total_enrollment
                FROM    enrollment e
                WHERE   e.course_id = c.id
            ) e ON true
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)        AS total_review,
                        AVG(r.rating)   AS avg_review
                FROM    course_review r
                WHERE   r.course_id = c.id
            ) r ON true
            WHERE   c.id            = :id
            AND     c.deleted_at    IS NULL
            """, nativeQuery = true)
    CourseDetailProjection findCourseDetail(UUID id, String username);

    @Query(value = """
            SELECT  c.id                                            AS id,
                    c.category_id                                   AS categoryId,
                    c.title                                         AS title,
                    c.description                                   AS description,
                    c.thumbnail_url                                 AS thumbnailUrl,
                    c.thumbnail_object_key                          AS thumbnailObjectKey,
                    c.created_at                                    AS createdAt,
                    c.created_by                                    AS createdBy,
                    c.price                                         AS originalPrice,
            
                    cd.discount_percentage                          AS discountedPercentage,
                    cd.valid_to                                     AS validTo,
            
                    COALESCE(e.total_enrollment, 0)                 AS totalEnrollment,
                    COALESCE(r.total_review, 0)                     AS totalReview,
                    COALESCE(r.avg_review, 0)                       AS avgReview,
            
                    (
                        COALESCE(r.avg_review, 0)
                        * LN(COALESCE(r.total_review, 0) + 1)
                    )
                    +
                    LN(COALESCE(e.total_enrollment, 0) + 1)         AS score
            
            FROM course c
            
            LEFT JOIN course_discount cd
                ON  c.id = cd.course_id
                AND now() BETWEEN cd.valid_from AND cd.valid_to
            
            LEFT JOIN LATERAL (
                SELECT COUNT(*) AS total_enrollment
                FROM enrollment e
                WHERE e.course_id = c.id
            ) e ON true
            
            LEFT JOIN LATERAL (
                SELECT COUNT(*)        AS total_review,
                       AVG(r.rating)   AS avg_review
                FROM course_review r
                WHERE r.course_id = c.id
            ) r ON true
            
            WHERE c.deleted_at IS NULL
            ORDER BY score DESC, c.created_at DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<CourseDetailProjection> findHighlightedCourses(int limit);

    @Query(value = """
            WITH valid_courses AS (
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
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT :limit
            )
            SELECT  vc.*,
                    COALESCE(e.total_enrollment, 0)     AS totalEnrollment,
                    COALESCE(r.total_review, 0)         AS totalReview,
                    COALESCE(r.avg_review, 0)           AS avgReview
            FROM valid_courses vc
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)    AS total_enrollment
                FROM    enrollment e
                WHERE   e.course_id = vc.id
            ) e ON true
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)        AS total_review,
                        AVG(r.rating)   AS avg_review
                FROM    course_review r
                WHERE   r.course_id = vc.id
            ) r ON true
            """, nativeQuery = true)
    List<CourseDetailProjection> findByCursor(UUID lastId, LocalDateTime lastCreatedAt, int limit);

    @Query(value = """
            WITH valid_courses AS (
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
                WHERE   (c.created_at, c.id)    <= (:lastCreatedAt, :lastId)
                AND     c.deleted_at            IS NULL
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT :limit
            )
            SELECT  vc.*,
                    COALESCE(e.total_enrollment, 0)     AS totalEnrollment,
                    COALESCE(r.total_review, 0)         AS totalReview,
                    COALESCE(r.avg_review, 0)           AS avgReview
            FROM valid_courses vc
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)    AS total_enrollment
                FROM    enrollment e
                WHERE   e.course_id = vc.id
            ) e ON true
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)        AS total_review,
                        AVG(r.rating)   AS avg_review
                FROM    course_review r
                WHERE   r.course_id = vc.id
            ) r ON true
            """, nativeQuery = true)
    List<CourseDetailProjection> findActiveCoursesByCursor(UUID lastId, LocalDateTime lastCreatedAt, int limit);

    @Query(value = """
            WITH valid_courses AS (
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
                WHERE   (c.created_at, c.id)    <= (:lastCreatedAt, :lastId)
                AND     deleted_at              IS NOT NULL
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT :limit
            )
            SELECT  vc.*,
                    COALESCE(e.total_enrollment, 0)     AS totalEnrollment,
                    COALESCE(r.total_review, 0)         AS totalReview,
                    COALESCE(r.avg_review, 0)           AS avgReview
            FROM valid_courses vc
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)    AS total_enrollment
                FROM    enrollment e
                WHERE   e.course_id = vc.id
            ) e ON true
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)        AS total_review,
                        AVG(r.rating)   AS avg_review
                FROM    course_review r
                WHERE   r.course_id = vc.id
            ) r ON true
            """, nativeQuery = true)
    List<CourseDetailProjection> findDeletedCoursesByCursor(UUID lastId, LocalDateTime lastCreatedAt, int limit);

    @Query(value = """
            WITH valid_courses AS (
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
                AND     (c.created_at, c.id)    <= (:lastCreatedAt, :lastId)
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT :limit
            )
            SELECT  vc.*,
                    COALESCE(e.total_enrollment, 0)     AS totalEnrollment,
                    COALESCE(r.total_review, 0)         AS totalReview,
                    COALESCE(r.avg_review, 0)           AS avgReview
            FROM valid_courses vc
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)    AS total_enrollment
                FROM    enrollment e
                WHERE   e.course_id = vc.id
            ) e ON true
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)        AS total_review,
                        AVG(r.rating)   AS avg_review
                FROM    course_review r
                WHERE   r.course_id = vc.id
            ) r ON true
            """, nativeQuery = true)
    List<CourseDetailProjection> findByCategoryIdAndCursor(UUID categoryId, UUID lastId, LocalDateTime lastCreatedAt, int limit);

    @Query(value = """
            WITH valid_courses AS (
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
                WHERE   (c.created_at, c.id)    <= (:lastCreatedAt, :lastId)
                AND     c.category_id           = :categoryId
                AND     c.deleted_at            IS NULL
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT :limit
            )
            SELECT  vc.*,
                    COALESCE(e.total_enrollment, 0)     AS totalEnrollment,
                    COALESCE(r.total_review, 0)         AS totalReview,
                    COALESCE(r.avg_review, 0)           AS avgReview
            FROM valid_courses vc
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)    AS total_enrollment
                FROM    enrollment e
                WHERE   e.course_id = vc.id
            ) e ON true
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)        AS total_review,
                        AVG(r.rating)   AS avg_review
                FROM    course_review r
                WHERE   r.course_id = vc.id
            ) r ON true
            """, nativeQuery = true)
    List<CourseDetailProjection> findActiveCoursesByCategoryIdAndCursor(UUID categoryId, UUID lastId, LocalDateTime lastCreatedAt, int limit);

    @Query(value = """
            WITH valid_courses AS (
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
                WHERE   (c.created_at, c.id)    <= (:lastCreatedAt, :lastId)
                AND     c.category_id           = :categoryId
                AND     c.deleted_at            IS NOT NULL
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT :limit
            )
            SELECT  vc.*,
                    COALESCE(e.total_enrollment, 0)     AS totalEnrollment,
                    COALESCE(r.total_review, 0)         AS totalReview,
                    COALESCE(r.avg_review, 0)           AS avgReview
            FROM valid_courses vc
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)    AS total_enrollment
                FROM    enrollment e
                WHERE   e.course_id = vc.id
            ) e ON true
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)        AS total_review,
                        AVG(r.rating)   AS avg_review
                FROM    course_review r
                WHERE   r.course_id = vc.id
            ) r ON true
            """, nativeQuery = true)
    List<CourseDetailProjection> findDeletedCoursesByCategoryIdAndCursor(UUID categoryId, UUID lastId, LocalDateTime lastCreatedAt, int limit);

    @Query(value = """
            WITH valid_courses AS (
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
                WHERE   immutable_unaccent(c.title)     ILIKE immutable_unaccent(CONCAT('%', :keyword, '%'))
                AND     (c.created_at, c.id)            <= (:lastCreatedAt, :lastId)
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT :limit
            )
            SELECT  vc.*,
                    COALESCE(e.total_enrollment, 0)     AS totalEnrollment,
                    COALESCE(r.total_review, 0)         AS totalReview,
                    COALESCE(r.avg_review, 0)           AS avgReview
            FROM valid_courses vc
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)    AS total_enrollment
                FROM    enrollment e
                WHERE   e.course_id = vc.id
            ) e ON true
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)        AS total_review,
                        AVG(r.rating)   AS avg_review
                FROM    course_review r
                WHERE   r.course_id = vc.id
            ) r ON true
            """, nativeQuery = true)
    List<CourseDetailProjection> searchCoursesByCursor(String keyword, UUID lastId, LocalDateTime lastCreatedAt, int limit);

    @Query(value = """
            WITH valid_courses AS (
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
                WHERE   immutable_unaccent(c.title)     ILIKE immutable_unaccent(CONCAT('%', :keyword, '%'))
                AND     (c.created_at, c.id)            <= (:lastCreatedAt, :lastId)
                AND     c.deleted_at                    IS NULL
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT :limit
            )
            SELECT  vc.*,
                    COALESCE(e.total_enrollment, 0)     AS totalEnrollment,
                    COALESCE(r.total_review, 0)         AS totalReview,
                    COALESCE(r.avg_review, 0)           AS avgReview
            FROM valid_courses vc
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)    AS total_enrollment
                FROM    enrollment e
                WHERE   e.course_id = vc.id
            ) e ON true
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)        AS total_review,
                        AVG(r.rating)   AS avg_review
                FROM    course_review r
                WHERE   r.course_id = vc.id
            ) r ON true
            """, nativeQuery = true)
    List<CourseDetailProjection> searchActiveCoursesByCursor(String keyword, UUID lastId, LocalDateTime lastCreatedAt, int limit);

    @Query(value = """
            WITH valid_courses AS (
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
                WHERE   immutable_unaccent(c.title)     ILIKE immutable_unaccent(CONCAT('%', :keyword, '%'))
                AND     (c.created_at, c.id)            <= (:lastCreatedAt, :lastId)
                AND     c.deleted_at                    IS NOT NULL
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT :limit
            )
            SELECT  vc.*,
                    COALESCE(e.total_enrollment, 0)     AS totalEnrollment,
                    COALESCE(r.total_review, 0)         AS totalReview,
                    COALESCE(r.avg_review, 0)           AS avgReview
            FROM valid_courses vc
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)    AS total_enrollment
                FROM    enrollment e
                WHERE   e.course_id = vc.id
            ) e ON true
            LEFT JOIN LATERAL (
                SELECT  COUNT(*)        AS total_review,
                        AVG(r.rating)   AS avg_review
                FROM    course_review r
                WHERE   r.course_id = vc.id
            ) r ON true
            """, nativeQuery = true)
    List<CourseDetailProjection> searchDeletedCoursesByCursor(String keyword, UUID lastId, LocalDateTime lastCreatedAt, int limit);

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
