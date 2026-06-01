package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.dto.EnrolledCourseProjection;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserProjection;
import com.pht.dev_edu.enrollment.entity.EnrollmentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, UUID> {
    @Query(value = """
                        SELECT  e.id                    AS id,
                                c.id                    AS courseId,
                                c.title                 AS title,
                                c.description           AS description,
                                c.thumbnail_url         AS thumbnailUrl,
                                e.enrolled_at           AS enrolledAt,
                                oi.price                AS discountedPrice
                        FROM enrollment e
                        LEFT JOIN course c
                            ON e.course_id = c.id
                        LEFT JOIN "order" o
                            ON e.order_id = o.id
                        LEFT JOIN order_item oi
                            ON  o.id        = oi.order_id
                            AND oi.item_id  = c.id
                        WHERE   e.student_username      = :studentUsername
                        AND     (e.enrolled_at, e.id)   < (:lastUpdatedAt, :lastId)
                        ORDER BY e.enrolled_at DESC, e.id DESC
            """, countQuery = """
                        SELECT COUNT(e.course_id)
                        FROM enrollment e
                        WHERE   e.student_username  = :studentUsername
            """,
            nativeQuery = true)
    Page<EnrolledCourseProjection> findEnrolledCoursesByStudentUsernameAndCursor(String studentUsername, UUID lastId, LocalDateTime lastUpdatedAt, Pageable pageable);

    @Query(value = """
                        SELECT  c.id                    AS id,
                                c.id                    AS courseId,
                                c.title                 AS title,
                                c.description           AS description,
                                c.thumbnail_url         AS thumbnailUrl,
                                c.created_at            AS enrolledAt,
                                c.price                 AS discountedPrice
                        FROM course_lecturer cl
                        LEFT JOIN course c
                            ON cl.course_id = c.id
                        WHERE   cl.lecturer_username  = :lecturerUsername
                        AND     (c.created_at, c.id) < (:lastUpdatedAt, :lastId)
                        ORDER BY c.created_at DESC, c.id DESC
            """, countQuery = """
                        SELECT  COUNT(c.id)
                        FROM course_lecturer cl
                        LEFT JOIN course c
                            ON cl.course_id = c.id
                        WHERE   cl.lecturer_username  = :lecturerUsername
            """,
            nativeQuery = true)
    Page<EnrolledCourseProjection> findCoursesAssignedToLecturerByCursor(String lecturerUsername, UUID lastId, LocalDateTime lastUpdatedAt, Pageable pageable);


    @Query(value = """
                        SELECT  e.id                 AS id,
                                u.username           AS studentUsername,
                                u.full_name          AS studentFullName,
                                e.enrolled_at        AS enrolledAt
                        FROM enrollment e
                        LEFT JOIN "user" u
                            ON e.student_username = u.username
                        WHERE   e.course_id             = :courseId
                        AND     (e.enrolled_at, e.id)   < (:lastUpdatedAt, :lastId)
                        ORDER BY e.enrolled_at DESC, e.id DESC
            """, countQuery = """
                        SELECT COUNT(e.student_username)
                        FROM enrollment e
                        WHERE e.course_id = :courseId
            """,
            nativeQuery = true)
    Page<EnrollmentUserProjection> findEnrolledUsersByCourseIdAndCursor(UUID courseId, UUID lastId, LocalDateTime lastUpdatedAt, Pageable pageable);

    boolean existsByCourseId(UUID courseId);

    boolean existsByStudentUsernameAndCourseId(String studentUsername, UUID courseId);

    @Modifying
    @Query(value = """
            INSERT INTO enrollment (id, student_username, course_id, order_id)
            VALUES (:id, :studentUsername, :courseId, :orderId)
            ON CONFLICT (student_username, course_id) DO NOTHING
            """, nativeQuery = true)
    void insertWithoutConstraintCheck(UUID id, String studentUsername, UUID courseId, UUID orderId);
}
