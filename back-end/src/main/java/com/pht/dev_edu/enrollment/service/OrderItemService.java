package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.CourseItemDetailResponse;
import com.pht.dev_edu.enrollment.dto.OrderDetailResponse;
import com.pht.dev_edu.enrollment.dto.PaymentStatus;

import java.util.UUID;

/**
 * Service for managing user shopping carts and order history.
 */
public interface OrderItemService {

    /**
     * Adds a course to the user's shopping cart.
     *
     * @param username the username of the user.
     * @param courseId the UUID of the course to add.
     */
    void addCourseToCart(String username, UUID courseId);

    /**
     * Removes a course from the user's shopping cart.
     *
     * @param username the username of the user.
     * @param courseId the UUID of the course to remove.
     */
    void removeCourseFromCart(String username, UUID courseId);

    /**
     * Retrieves all courses currently in the user's shopping cart.
     *
     * @param username   the username of the user.
     * @param nextCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link CourseItemDetailResponse} items.
     */
    CustomPaging<CourseItemDetailResponse> getCoursesInCart(String username, String nextCursor);

    /**
     * Retrieves the user's order history filtered by payment status.
     *
     * @param username      the username of the user.
     * @param paymentStatus the {@link PaymentStatus} filter (PAID, PENDING, FAILED).
     * @param nextCursor    the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link OrderDetailResponse} items.
     */
    CustomPaging<OrderDetailResponse> getOrderHistory(String username, PaymentStatus paymentStatus, String nextCursor);
}
