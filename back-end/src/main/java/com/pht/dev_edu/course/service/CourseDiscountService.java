package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.CourseDiscountRequest;
import com.pht.dev_edu.course.dto.CourseDiscountResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing course discounts and promotional schedules.
 */
public interface CourseDiscountService {

    /**
     * Retrieves all scheduled course discounts with cursor-based pagination.
     *
     * @param nextCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link CourseDiscountResponse} items.
     */
    CustomPaging<CourseDiscountResponse> getAllScheduledDiscounts(String nextCursor);

    /**
     * Retrieves scheduled discounts for a specific course.
     *
     * @param courseId the UUID of the course.
     * @return a list of {@link CourseDiscountResponse} items.
     */
    List<CourseDiscountResponse> getScheduledDiscountsByCourse(UUID courseId);

    /**
     * Creates a new discount campaign for a course.
     *
     * @param username      the username of the lecturer or admin creating the discount.
     * @param couponRequest the {@link CourseDiscountRequest} containing course ID, discount rate, and validity period.
     * @return the created {@link CourseDiscountResponse}.
     */
    CourseDiscountResponse createDiscount(String username, CourseDiscountRequest couponRequest);

    /**
     * Deletes a scheduled course discount.
     *
     * @param username   the username of the user requesting deletion.
     * @param discountId the UUID of the discount to delete.
     */
    void deleteDiscount(String username, UUID discountId);
}
