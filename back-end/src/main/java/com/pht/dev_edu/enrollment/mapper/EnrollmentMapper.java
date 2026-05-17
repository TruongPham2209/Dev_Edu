package com.pht.dev_edu.enrollment.mapper;

import com.pht.dev_edu.enrollment.dto.EnrolledCourseProjection;
import com.pht.dev_edu.enrollment.dto.CourseItemDetailResponse;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserProjection;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {
    @Mapping(target = "username", source = "studentUsername")
    @Mapping(target = "fullName", source = "studentFullName")
    EnrollmentUserResponse toEnrollmentUserResponse(EnrollmentUserProjection projection);

    @Mapping(target = "timestamp", source = "enrolledAt")
    CourseItemDetailResponse toEnrolledCourseResponse(EnrolledCourseProjection projection);
}
