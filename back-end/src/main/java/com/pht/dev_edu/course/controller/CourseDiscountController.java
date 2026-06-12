package com.pht.dev_edu.course.controller;

import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.course.dto.CourseDiscountRequest;
import com.pht.dev_edu.course.service.CourseDiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/course-discounts")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CourseDiscountController {
    CourseDiscountService courseDiscountService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getDiscounts(
            @RequestParam(required = false) String nextCursor,
            @RequestParam(required = false) UUID courseId
    ) {
        if (courseId != null) {
            var discounts = courseDiscountService.getScheduledDiscountsByCourse(courseId);
            return ApiUtils.buildSuccessResponse(discounts);
        }

        var discounts = courseDiscountService.getAllScheduledDiscounts(nextCursor);
        return ApiUtils.buildSuccessResponse(discounts);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createDiscount(@RequestBody @Valid CourseDiscountRequest courseDiscountReq) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var newDiscount = courseDiscountService.createDiscount(username, courseDiscountReq);
        return ApiUtils.buildSuccessResponse(newDiscount);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping
    public ResponseEntity<?> deleteDiscount(@RequestParam UUID discountId) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        courseDiscountService.deleteDiscount(username, discountId);
        return ApiUtils.buildSuccessResponse("Discount deleted successfully");
    }
}
