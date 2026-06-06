package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.dto.ReviewProjection;
import com.pht.dev_edu.course.entity.CourseReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CourseReviewRepository extends JpaRepository<CourseReviewEntity, UUID> {
    @Query(value = """
            SELECT  r.id                AS id,
                    r.comment           AS comment,
                    r.course_id         AS courseId,
                    r.rating            AS rating,
                    r.student_username  AS username,
                    u.full_name         AS fullName,
                    u.avatar_url        AS avatarUrl,
                    r.created_at        AS createdAt
            FROM course_review r
            LEFT JOIN "user" u
                ON r.student_username = u.username
            WHERE   course_id           = :courseId
            AND     student_username    = :studentUsername
            """, nativeQuery = true)
    List<ReviewProjection> findByCourseIdAndStudentUsername(UUID courseId, String studentUsername);

    boolean existsByCourseIdAndStudentUsername(UUID courseId, String studentUsername);

    @Query(value = """
            SELECT  r.id                AS id,
                    r.comment           AS comment,
                    r.course_id         AS courseId,
                    r.rating            AS rating,
                    r.student_username  AS username,
                    u.full_name         AS fullName,
                    u.avatar_url        AS avatarUrl,
                    r.created_at        AS createdAt
            FROM course_review r
            LEFT JOIN "user" u
                ON r.student_username       = u.username
            WHERE   course_id               = :courseId
            AND     (r.created_at, r.id)    < (:lastCreatedAt, :lastId)
            ORDER BY r.created_at DESC, r.id DESC
            """, countQuery = """
            SELECT COUNT(*)
            FROM course_review
            WHERE   course_id = :courseId
            """, nativeQuery = true)
    Page<ReviewProjection> findByCourseIdAndCursor(UUID courseId, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  r.id                AS id,
                    r.comment           AS comment,
                    r.course_id         AS courseId,
                    r.rating            AS rating,
                    r.student_username  AS username,
                    u.full_name         AS fullName,
                    u.avatar_url        AS avatarUrl,
                    r.created_at        AS createdAt
            FROM course_review r
            LEFT JOIN "user" u
                ON r.student_username       = u.username
            WHERE   course_id               = :courseId
            AND     username                = :username
            """, nativeQuery = true)
    ReviewProjection findByUsernameAndCourseId(String username, UUID courseId);
}