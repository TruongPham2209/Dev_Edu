package com.pht.dev_edu.course.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.ItemStatus;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.course.dto.CoursePageRequest;
import com.pht.dev_edu.course.dto.CourseRequest;
import com.pht.dev_edu.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController("CourseCategoryController")
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CourseCategoryController {
    CourseService courseService;

    @PreAuthorize("permitAll()")
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse> getCourses(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String nextCursor,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String keyword
    ) {

        CoursePageRequest pageRequest = CoursePageRequest.builder()
                .status(ItemStatus.ACTIVE)
                .size(12)
                .nextCursor(nextCursor)
                .sortBy(sortBy)
                .build();

        var courses = courseService.getCourses(categoryId, keyword, pageRequest);

        return ApiUtils.buildSuccessResponse(courses);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse> getCourseById(@PathVariable UUID courseId) {
        var course = courseService.getCourseById(courseId);
        var lecturers = courseService.getLecturersForCourse(courseId);
        course.setLecturers(lecturers);
        return ApiUtils.buildSuccessResponse(course);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/courses")
    public ResponseEntity<ApiResponse> getAdminCourses(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String nextCursor,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam ItemStatus status
    ) {
        CoursePageRequest pageRequest = CoursePageRequest.builder()
                .status(status)
                .size(10)
                .nextCursor(nextCursor)
                .sortBy(sortBy)
                .build();

        var courses = courseService.getCourses(categoryId, keyword, pageRequest);

        return ApiUtils.buildSuccessResponse(courses);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/courses")
    public ResponseEntity<ApiResponse> createCourse(@RequestBody CourseRequest course) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var createdCourse = courseService.createCourse(username, course);
        return ApiUtils.buildSuccessResponse(createdCourse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/courses")
    public ResponseEntity<ApiResponse> updateCourse(@RequestBody CourseRequest course) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var createdCourse = courseService.updateCourse(username, course);
        return ApiUtils.buildSuccessResponse(createdCourse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/courses")
    public ResponseEntity<ApiResponse> deleteCourse(@RequestParam UUID courseId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        courseService.deleteCourse(username, courseId);
        return ApiUtils.buildSuccessResponse("Course deleted successfully");
    }
}
