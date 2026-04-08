package com.pht.dev_edu.course.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.ItemStatus;
import com.pht.dev_edu.common.util.ApiUtil;
import com.pht.dev_edu.common.util.SecurityContextUtil;
import com.pht.dev_edu.common.validation.CreateValidation;
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
        return ApiUtil.buildSuccessResponse(categories);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/categories")
    public ResponseEntity<ApiResponse> getAllCategoriesForAdmin(@RequestParam ItemStatus status) {
        var categories = categoryService.getAllCategories(status);
        return ApiUtil.buildSuccessResponse(categories);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/categories")
    public ResponseEntity<ApiResponse> createCategory(@Validated({CreateValidation.class}) @RequestBody CategoryRequest category) {
        var author = SecurityContextUtil.getCurrentUsername();
        var createdCategory = categoryService.saveCategory(author, category);
        return ApiUtil.buildSuccessResponse(createdCategory);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/categories")
    public ResponseEntity<ApiResponse> updateCategory(@Validated @RequestBody CategoryRequest category) {
        var author = SecurityContextUtil.getCurrentUsername();
        var updatedCategory = categoryService.saveCategory(author, category);
        return ApiUtil.buildSuccessResponse(updatedCategory);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/categories/{categoryId}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable UUID categoryId) {
        categoryService.deleteCategory(categoryId);
        return ApiUtil.buildSuccessResponse("Category deleted successfully");
    }
}
