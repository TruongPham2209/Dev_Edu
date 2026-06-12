package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.CoursePageRequest;
import com.pht.dev_edu.course.dto.CourseRequest;
import com.pht.dev_edu.course.dto.CourseResponse;

import java.util.List;
import java.util.UUID;

public interface CourseService {
    CourseResponse getCourseDetails(String username, UUID courseId);

    // For cache and validate
    CourseResponse getCourseById(UUID courseId);

    List<CourseResponse> getHighlightedCourses();

    CustomPaging<CourseResponse> getCourses(UUID categoryId, String keyword, CoursePageRequest pageRequest);

    CourseResponse createCourse(String author, CourseRequest course);

    CourseResponse updateCourse(String username, CourseRequest course);

    void deleteCourse(String actor, UUID courseId);
}
