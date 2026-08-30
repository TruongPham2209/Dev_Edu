package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.CourseItemDetailResponse;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing student course enrollments and lecturer assignments.
 */
public interface EnrollmentService {

    /**
     * Retrieves all courses enrolled by the specified student with cursor-based pagination.
     *
     * @param username   the username of the enrolled student.
     * @param nextCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link CourseItemDetailResponse} items.
     */
    CustomPaging<CourseItemDetailResponse> getEnrolledCourses(String username, String nextCursor);

    /**
     * Finds courses assigned to a specific lecturer.
     *
     * @param lecturerUsername the username of the lecturer.
     * @param keyword          the search keyword (optional).
     * @param categoryId       the category UUID filter (optional).
     * @param nextCursor       the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link CourseItemDetailResponse} items.
     */
    CustomPaging<CourseItemDetailResponse> findCoursesAssignedToLecturer(String lecturerUsername, String keyword, UUID categoryId, String nextCursor);

    /**
     * Retrieves enrolled students for a specific course with cursor pagination.
     *
     * @param courseId   the UUID of the course.
     * @param nextCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link EnrollmentUserResponse} items.
     */
    CustomPaging<EnrollmentUserResponse> getEnrolledUsers(UUID courseId, String nextCursor);

    /**
     * Enrolls a user in a list of courses after successful order payment.
     *
     * @param username  the username of the student.
     * @param courseIds the list of course UUIDs to enroll.
     * @param orderId   the UUID of the associated order.
     */
    void enrollUserInCourse(String username, List<UUID> courseIds, UUID orderId);
}
