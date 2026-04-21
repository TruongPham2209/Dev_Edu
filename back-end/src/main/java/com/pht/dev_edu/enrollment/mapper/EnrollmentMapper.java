package com.pht.dev_edu.enrollment.mapper;

import com.pht.dev_edu.course.dto.EnrolledCourseProjection;
import com.pht.dev_edu.course.dto.EnrolledCourseResponse;
import com.pht.dev_edu.course.dto.EnrollmentUserProjection;
import com.pht.dev_edu.course.dto.EnrollmentUserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {
    @Mapping(target = "username", source = "studentUsername")
    @Mapping(target = "fullName", source = "studentFullName")
    EnrollmentUserResponse toEnrollmentUserResponse(EnrollmentUserProjection projection);

    EnrolledCourseResponse toEnrolledCourseResponse(EnrolledCourseProjection projection);
}
