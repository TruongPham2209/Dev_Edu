package com.pht.dev_edu.course.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.ItemStatus;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.common.validation.CreateValidation;
import com.pht.dev_edu.common.validation.UpdateValidation;
import com.pht.dev_edu.course.dto.CoursePageRequest;
import com.pht.dev_edu.course.dto.CourseRequest;
import com.pht.dev_edu.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
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
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false) ItemStatus status
    ) {
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();
        int size;
        if (authorities.contains(RoleEnum.ADMIN.name())) {
            size = 10;
        } else {
            size = 12;
            status = ItemStatus.ACTIVE;
        }

        CoursePageRequest pageRequest = CoursePageRequest.builder()
                .status(status)
                .size(size)
                .page(page)
                .nextCursor(nextCursor)
                .sortBy(sortBy)
                .build();

        var courses = courseService.getCourses(categoryId, keyword, pageRequest);

        return ApiUtils.buildSuccessResponse(courses);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/courses/highlighted")
    public ResponseEntity<ApiResponse> getHighlightedCourses() {
        var courses = courseService.getHighlightedCourses();

        return ApiUtils.buildSuccessResponse(courses);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/courses/{courseId}/")
    public ResponseEntity<ApiResponse> getCourseById(@PathVariable UUID courseId) {
        String username = SecurityContextUtils.getCurrentUsername();
        var course = courseService.getCourseDetails(username, courseId);
        return ApiUtils.buildSuccessResponse(course);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/courses")
    public ResponseEntity<ApiResponse> createCourse(@RequestBody @Validated({CreateValidation.class}) CourseRequest course) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var createdCourse = courseService.createCourse(username, course);
        return ApiUtils.buildSuccessResponse(createdCourse);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/courses")
    public ResponseEntity<ApiResponse> updateCourse(@RequestBody @Validated({UpdateValidation.class}) CourseRequest course) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var createdCourse = courseService.updateCourse(username, course);
        return ApiUtils.buildSuccessResponse(createdCourse);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/courses")
    public ResponseEntity<ApiResponse> deleteCourse(@RequestParam UUID courseId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        courseService.deleteCourse(username, courseId);
        return ApiUtils.buildSuccessResponse("Course deleted successfully");
    }
}
