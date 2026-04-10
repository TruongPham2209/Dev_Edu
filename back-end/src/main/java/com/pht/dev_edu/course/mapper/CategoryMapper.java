package com.pht.dev_edu.course.mapper;

import com.pht.dev_edu.course.dto.CategoryRequest;
import com.pht.dev_edu.course.dto.CategoryResponse;
import com.pht.dev_edu.course.entity.CategoryEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryEntity reqToEntity(CategoryRequest req);

    CategoryResponse entityToRes(CategoryEntity entity);
}
