package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.dto.CourseDiscountProjection;
import com.pht.dev_edu.enrollment.dto.CourseOrderItemProjection;
import com.pht.dev_edu.enrollment.entity.CourseDiscountEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseDiscountRepository extends JpaRepository<CourseDiscountEntity, UUID> {
    @Query(value = """
                SELECT  c.id                        AS courseId,
                        c.title                     AS courseTitle,
                        c.price                     AS originalPrice,
                        c.description               AS courseDescription,
                        c.thumbnail_url             AS courseThumbnailUrl,
            
                        cd.id                       AS id,
                        cd.description              AS discountDescription,
                        cd.discount_percentage      AS discountPercentage,
                        cd.valid_from               AS validFrom,
                        cd.valid_to                 AS validTo,
                        cd.created_by               AS createdBy,
                        cd.created_at               AS createdAt
                FROM course_discount cd
                LEFT JOIN course c
                    ON c.id = cd.course_id
                WHERE   (cd.valid_from, cd.id)  < (:lastValidFrom, :lastId)
                AND     cd.valid_from           >= :validStartTime
                ORDER BY cd.created_at DESC, cd.id DESC
            """, countQuery = """
                SELECT  COUNT(*)
                FROM course_discount cd
                LEFT JOIN course c
                    ON c.id = cd.course_id
                WHERE   cd.valid_from >= :validStartTime
            """, nativeQuery = true)
    Page<CourseDiscountProjection> getAllScheduledDiscountsWithCursor(LocalDateTime validStartTime, UUID lastId, LocalDateTime lastValidFrom, Pageable pageable);

    @Query(value = """
                SELECT  c.id                        AS courseId,
                        c.title                     AS courseTitle,
                        c.description               AS courseDescription,
                        c.thumbnail_url             AS courseThumbnailUrl,
                        c.price                     AS originalPrice,
            
                        cd.id                       AS id,
                        cd.description              AS discountDescription,
                        cd.discount_percentage      AS discountPercentage,
                        cd.valid_from               AS validFrom,
                        cd.valid_to                 AS validTo,
                        cd.created_by               AS createdBy,
                        cd.created_at               AS createdAt
                FROM course_discount cd
                LEFT JOIN course c
                    ON c.id = cd.course_id
                WHERE   cd.course_id    = :courseId
                AND     cd.valid_from   >= :validStartTime
                ORDER BY cd.created_at DESC, cd.id DESC
            """, nativeQuery = true)
    List<CourseDiscountProjection> getAllScheduledDiscountsByCourseId(LocalDateTime validStartTime, UUID courseId);

    @Query("SELECT cd FROM CourseDiscountEntity cd WHERE cd.courseId IS NULL AND  (:now BETWEEN cd.validFrom AND cd.validTo)")
    Optional<CourseDiscountEntity> getGlobalActiveDiscount(LocalDateTime now);

    @Query(value = """
                SELECT EXISTS (
                    SELECT 1
                    FROM course_discount cd
                    WHERE cd.course_id = :courseId
                    AND (
                        (cd.valid_from < :validTo AND cd.valid_to > :validFrom)
                    )
                )
            """, nativeQuery = true)
    boolean existsOverlappingDiscount(UUID courseId, LocalDateTime validFrom, LocalDateTime validTo);

    @Query(value = """
                SELECT EXISTS (
                    SELECT 1
                    FROM course_discount cd
                    WHERE cd.course_id IS NULL
                    AND (
                        (cd.valid_from < :validTo AND cd.valid_to > :validFrom)
                    )
                )
            """, nativeQuery = true)
    boolean existsOverlappingDiscount(LocalDateTime validFrom, LocalDateTime validTo);

    @Query(value = """
                SELECT  c.id                                    AS id,
                        c.title                                 AS title,
                        c.thumbnail_url                         AS thumbnailUrl,
                        COALESCE(cd.discount_percentage, 0.0)   AS discountedPercentage,
                        c.price                                 AS originalPrice,
                        (e.student_username IS NOT NULL)        AS registered
                FROM course c
                LEFT JOIN course_discount cd
                    ON  c.id = cd.course_id
                    AND cd.valid_from <= :now
                    AND cd.valid_to >= :now
                LEFT JOIN enrollment e
                    ON  e.course_id = c.id
                    AND e.student_username = :username
                WHERE c.id IN :courseIds
            """, nativeQuery = true)
    List<CourseOrderItemProjection> findDiscountedCoursesForUser(String username, List<UUID> courseIds, LocalDateTime now);
}