package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.CourseCursorRequest;
import com.pht.dev_edu.course.dto.CourseRequest;
import com.pht.dev_edu.course.dto.CourseResponse;

import java.util.List;
import java.util.UUID;

/**
 * Core service for managing courses, course listings, search, and details.
 */
public interface CourseService {

    /**
     * Retrieves detailed information of a course, including registration status for the user.
     *
     * @param username the username of the viewing user (can be null for anonymous viewers).
     * @param courseId the UUID of the course.
     * @return the {@link CourseResponse} containing course details.
     */
    CourseResponse getCourseDetail(String username, UUID courseId);

    /**
     * Retrieves course information by ID (used for caching and cross-service validation).
     *
     * @param courseId the UUID of the course.
     * @return the {@link CourseResponse}.
     */
    CourseResponse getCourseById(UUID courseId);

    /**
     * Retrieves the top highlighted / featured courses based on ratings and enrollment.
     *
     * @return a list of featured {@link CourseResponse} items.
     */
    List<CourseResponse> getHighlightedCourses();

    /**
     * Searches and paginates courses by category, keyword, and cursor.
     *
     * @param categoryId  the category UUID filter (optional).
     * @param keyword     the search keyword for title matching (optional).
     * @param pageRequest the {@link CourseCursorRequest} containing cursor and limit.
     * @return a {@link CustomPaging} of {@link CourseResponse} items.
     */
    CustomPaging<CourseResponse> getCourses(UUID categoryId, String keyword, CourseCursorRequest pageRequest);

    /**
     * Creates a new course.
     *
     * @param author the username of the instructor or admin creating the course.
     * @param course the {@link CourseRequest} containing title, description, price, category, and thumbnail.
     * @return the created {@link CourseResponse}.
     */
    CourseResponse createCourse(String author, CourseRequest course);

    /**
     * Updates an existing course's details.
     *
     * @param username the username of the user performing the update.
     * @param course   the {@link CourseRequest} containing updated data.
     * @return the updated {@link CourseResponse}.
     */
    CourseResponse updateCourse(String username, CourseRequest course);

    /**
     * Soft-deletes a course by ID.
     *
     * @param actor    the username of the user requesting deletion.
     * @param courseId the UUID of the course to delete.
     */
    void deleteCourse(String actor, UUID courseId);
}
