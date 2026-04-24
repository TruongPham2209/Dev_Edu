package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.enrollment.dto.CourseDiscountRequest;
import com.pht.dev_edu.enrollment.dto.CourseDiscountResponse;

import java.util.List;
import java.util.UUID;

public interface CourseDiscountService {
    CustomPaging<CourseDiscountResponse> getAllScheduledDiscounts(String nextCursor);

    List<CourseDiscountResponse> getScheduledDiscountsByCourse(UUID courseId);

    CourseDiscountResponse createDiscount(String username, CourseDiscountRequest couponRequest);

    void deleteDiscount(String username, UUID discountId);
}
