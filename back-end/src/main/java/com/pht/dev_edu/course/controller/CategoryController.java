package com.pht.dev_edu.course.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.ItemStatus;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.common.validation.CreateValidation;
import com.pht.dev_edu.common.validation.UpdateValidation;
import com.pht.dev_edu.course.dto.CategoryRequest;
import com.pht.dev_edu.course.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController("categoryController")
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {
    CategoryService categoryService;

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse> getAllCategories() {
        var categories = categoryService.getAllCategories(ItemStatus.ACTIVE);
        return ApiUtils.buildSuccessResponse(categories);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/admin/categories")
    public ResponseEntity<ApiResponse> getAllCategoriesForAdmin(@RequestParam ItemStatus status) {
        var categories = categoryService.getAllCategories(status);
        return ApiUtils.buildSuccessResponse(categories);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/admin/categories")
    public ResponseEntity<ApiResponse> createCategory(@Validated({CreateValidation.class}) @RequestBody CategoryRequest category) {
        var author = SecurityContextUtils.getCurrentUsername();
        var createdCategory = categoryService.saveCategory(author, category);
        return ApiUtils.buildSuccessResponse(createdCategory);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/admin/categories")
    public ResponseEntity<ApiResponse> updateCategory(@Validated({UpdateValidation.class}) @RequestBody CategoryRequest category) {
        var author = SecurityContextUtils.getCurrentUsername();
        var updatedCategory = categoryService.saveCategory(author, category);
        return ApiUtils.buildSuccessResponse(updatedCategory);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/admin/categories/{categoryId}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable UUID categoryId) {
        categoryService.deleteCategory(categoryId);
        return ApiUtils.buildSuccessResponse("Category deleted successfully");
    }
}
