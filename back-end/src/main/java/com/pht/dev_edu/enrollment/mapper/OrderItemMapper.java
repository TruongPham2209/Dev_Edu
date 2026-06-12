package com.pht.dev_edu.enrollment.mapper;

import com.pht.dev_edu.enrollment.dto.CourseItemResponse;
import com.pht.dev_edu.enrollment.dto.CourseOrderItemProjection;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {
    CourseItemResponse courseProjectionToCourseItem(CourseOrderItemProjection projection);
}
