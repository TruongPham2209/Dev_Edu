package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.enrollment.dto.EnrolledCourseResponse;

import java.util.UUID;

public interface OrderService {
    void addCourseToCart(String username, UUID courseId);

    void removeCourseFromCart(String username, UUID courseId);

    CustomPaging<EnrolledCourseResponse> getCoursesInCart(String username, String nextCursor);
}
