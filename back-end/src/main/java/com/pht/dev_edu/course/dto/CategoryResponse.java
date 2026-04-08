package com.pht.dev_edu.course.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.course.entity.CategoryEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CategoryResponse {
    UUID id;
    String name;
    String description;
}