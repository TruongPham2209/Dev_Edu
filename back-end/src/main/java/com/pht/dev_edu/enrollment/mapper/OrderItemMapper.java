package com.pht.dev_edu.enrollment.mapper;

import com.pht.dev_edu.enrollment.dto.CourseItemResponse;
import com.pht.dev_edu.enrollment.dto.CourseOrderItemProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {
    @Mapping(target = "discountedPrice", ignore = true)
    CourseItemResponse courseProjectionToCourseItem(CourseOrderItemProjection projection);
}
