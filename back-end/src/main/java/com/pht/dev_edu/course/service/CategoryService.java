package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.dto.ItemStatus;
import com.pht.dev_edu.course.dto.CategoryRequest;
import com.pht.dev_edu.course.dto.CategoryResponse;
import com.pht.dev_edu.course.entity.CategoryEntity;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<CategoryResponse> getAllCategories(ItemStatus status);

    CategoryEntity getCategoryById(UUID categoryId);

    CategoryResponse saveCategory(String author, CategoryRequest category);

    void deleteCategory(UUID categoryId);
}
