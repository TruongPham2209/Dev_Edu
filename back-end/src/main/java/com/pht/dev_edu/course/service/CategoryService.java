package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.dto.ItemStatus;
import com.pht.dev_edu.course.dto.CategoryRequest;
import com.pht.dev_edu.course.dto.CategoryResponse;
import com.pht.dev_edu.course.entity.CategoryEntity;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing course categories.
 */
public interface CategoryService {

    /**
     * Retrieves all course categories filtered by active status.
     *
     * @param status the {@link ItemStatus} filter (ACTIVE, INACTIVE, ALL).
     * @return a list of {@link CategoryResponse} objects.
     */
    List<CategoryResponse> getAllCategories(ItemStatus status);

    /**
     * Retrieves a category entity by its ID (for internal service validation).
     *
     * @param categoryId the UUID of the category.
     * @return the {@link CategoryEntity}.
     */
    CategoryEntity getCategoryById(UUID categoryId);

    /**
     * Creates or updates a course category.
     *
     * @param author   the username of the administrator performing the operation.
     * @param category the {@link CategoryRequest} containing category name, description, and thumbnail.
     * @return the saved {@link CategoryResponse}.
     */
    CategoryResponse saveCategory(String author, CategoryRequest category);

    /**
     * Soft-deletes a category by its ID.
     *
     * @param categoryId the UUID of the category to delete.
     */
    void deleteCategory(UUID categoryId);
}
