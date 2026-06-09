package com.pht.dev_edu.course.mapper;

import com.pht.dev_edu.course.dto.CategoryDetailProjection;
import com.pht.dev_edu.course.dto.CategoryRequest;
import com.pht.dev_edu.course.dto.CategoryResponse;
import com.pht.dev_edu.course.entity.CategoryEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    CategoryEntity reqToEntity(CategoryRequest req);

    @Mapping(target = "totalCourses", constant = "0")
    CategoryResponse entityToRes(CategoryEntity entity);

    CategoryResponse projectionToRes(CategoryDetailProjection projection);
}
