package com.pht.dev_edu.enrollment.controller;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.enrollment.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;

    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping("/items/courses")
    public ResponseEntity<?> addCourseToCart(@RequestBody Map<String, String> request) {
        var courseIdStr = request.get("courseId");
        if (!StringUtils.hasText(courseIdStr)) {
            throw new BadRequestException("courseId is required.");
        }
        UUID courseId = UUID.fromString(courseIdStr);
        String username = SecurityContextUtils.getCurrentUsernameForController();
        orderService.addCourseToCart(username, courseId);
        return ApiUtils.buildSuccessResponse("Course added to cart successfully.");
    }

    @DeleteMapping("/items/courses")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<?> removeCourseFromCart(@RequestParam("courseId") UUID courseId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        orderService.removeCourseFromCart(username, courseId);
        return ApiUtils.buildSuccessResponse("Course removed from cart successfully.");
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/items/courses")
    public ResponseEntity<?> getCoursesInCart(
            @RequestParam(required = false) String nextCursor
    ) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var cartItems = orderService.getCoursesInCart(username, nextCursor);
        return ApiUtils.buildSuccessResponse(cartItems);
    }
}
