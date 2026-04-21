package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.course.dto.EnrolledCourseProjection;
import com.pht.dev_edu.course.dto.EnrollmentUserProjection;
import com.pht.dev_edu.enrollment.entity.EnrollmentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, UUID> {
    @Query(value = """
                        SELECT  e.id                 AS id,
                                c.id                 AS courseId,
                                c.title              AS title,
                                c.description        AS description,
                                c.thumbnail_url      AS thumbnailUrl,
                                e.enrolled_at        AS enrolledAt,
                                p.amount             AS amount
                        FROM enrollment e
                        JOIN course c
                            ON e.course_id = c.id
                        JOIN payment p 
                            ON e.id = p.entity_id
                        WHERE   e.student_username      = :studentUsername
                        AND     p.entity_type           = 'COURSE'
                        AND     (e.id, e.enrolled_at)   < (:lastId, :lastUpdatedAt)
            """, countQuery = """
                        SELECT COUNT(*)
                        FROM enrollment e
                        JOIN course
                            ON e.course_id = c.id
                        JOIN payment p
                            ON e.id = p.entity_id
                        WHERE   e.student_username  = :studentUsername
                        AND     p.entity_type       = 'COURSE'
            """,
            nativeQuery = true)
    Page<EnrolledCourseProjection> findEnrolledCoursesByStudentUsernameAndCursor(String studentUsername, UUID lastId, LocalDateTime lastUpdatedAt, Pageable pageable);

    @Query(value = """
                        SELECT  e.id                 AS id,
                                c.id                 AS courseId,
                                c.title              AS title,
                                c.description        AS description,
                                c.thumbnail_url      AS thumbnailUrl,
                                e.enrolled_at        AS enrolledAt,
                                p.amount             AS amount
                        FROM enrollment e
                        JOIN course c
                            ON e.course_id = c.id
                        JOIN payment p 
                            ON e.id = p.entity_id
                        WHERE   e.student_username      = :studentUsername
                        AND     e.course_id             = :courseId
                        AND     p.entity_type           = 'COURSE'
            """, nativeQuery = true)
    Optional<EnrolledCourseProjection> findEnrolledCoursesByStudentAndCourseId(String studentUsername, UUID courseId);


    @Query(value = """
                        SELECT  e.id                 AS id,
                                u.username           AS studentUsername,
                                u.full_name          AS studentFullName,
                                e.enrolled_at        AS enrolledAt
                        FROM enrollment e
                        JOIN user u
                            ON e.student_username = u.username
                        WHERE   e.student_username      = :studentUsername
                        AND     e.course_id             = :courseId
                        AND     (e.id, e.enrolled_at)   < (:lastId, :lastUpdatedAt)
            """, countQuery = """
                        SELECT COUNT(*)
                        FROM enrollment e
                        JOIN user u
                            ON e.student_username = u.username
                        WHERE   e.student_username      = :studentUsername
                        AND     e.course_id             = :courseId
            """,
            nativeQuery = true)
    Page<EnrollmentUserProjection> findEnrolledUsersByCourseIdAndCursor(UUID courseId, UUID lastId, LocalDateTime lastUpdatedAt, Pageable pageable);

    boolean existsByCourseId(UUID courseId);

    boolean existsByStudentUsernameAndCourseId(String studentUsername, UUID courseId);
}
