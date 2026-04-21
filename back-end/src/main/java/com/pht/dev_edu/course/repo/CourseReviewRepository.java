package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.entity.CourseReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CourseReviewRepository extends JpaRepository<CourseReviewEntity, UUID> {
    List<CourseReviewEntity> findByStudentUsernameAndCourseIdOrderByCreatedAtDesc(String studentUsername, UUID courseId);

    @Query(value = """
            SELECT * FROM course_review
            WHERE   course_id = :courseId
            AND     (created_at, id) < (:lastCreatedAt, :lastId)
            """, countQuery = """
                    SELECT COUNT(*) FROM course_review
                    WHERE   course_id = :courseId
            """, nativeQuery = true)
    Page<CourseReviewEntity> findByCourseIdAndCursor(UUID courseId, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);
}