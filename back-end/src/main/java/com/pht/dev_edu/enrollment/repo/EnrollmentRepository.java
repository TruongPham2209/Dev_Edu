package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.dto.EnrolledCourseProjection;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserProjection;
import com.pht.dev_edu.enrollment.entity.EnrollmentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
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
                        AND     (e.enrolled_at, e.id)   < (:lastUpdatedAt, :lastId)
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

    // TODO: Implement this query to find courses assigned to a lecturer with cursor pagination
    @Query(value = """

            """, countQuery = """

            """,
            nativeQuery = true)
    Page<EnrolledCourseProjection> findCoursesAssignedToLecturerByCursor(String lecturerUsername, UUID lastId, LocalDateTime lastUpdatedAt, Pageable pageable);


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
                        AND     (e.enrolled_at, e.id)   < (:lastUpdatedAt, :lastId)
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
