package com.pht.dev_edu.enrollment.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.pht.dev_edu.course.dto.CourseItemDetailResponse;
import com.pht.dev_edu.enrollment.dto.EnrolledCourseProjection;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserProjection;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserResponse;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {
    @Mapping(target = "username", source = "studentUsername")
    @Mapping(target = "fullName", source = "studentFullName")
    EnrollmentUserResponse toEnrollmentUserResponse(EnrollmentUserProjection projection);

    @Mapping(target = "status", ignore = true)
    @Mapping(target = "discountedPrice", ignore = true)
    @Mapping(target = "originalPrice", ignore = true)
    @Mapping(target = "timestamp", source = "enrolledAt")
    CourseItemDetailResponse toEnrolledCourseResponse(EnrolledCourseProjection projection);
}
