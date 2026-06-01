package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.enrollment.dto.CourseItemDetailResponse;
import com.pht.dev_edu.enrollment.dto.OrderDetailResponse;
import com.pht.dev_edu.enrollment.dto.PaymentStatus;

import java.util.UUID;

public interface OrderService {
    void addCourseToCart(String username, UUID courseId);

    void removeCourseFromCart(String username, UUID courseId);

    CustomPaging<CourseItemDetailResponse> getCoursesInCart(String username, String nextCursor);

    CustomPaging<OrderDetailResponse> getOrderHistory(String username, PaymentStatus paymentStatus, String nextCursor);
}
