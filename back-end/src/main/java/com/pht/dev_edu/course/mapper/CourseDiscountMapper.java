package com.pht.dev_edu.course.mapper;

import com.pht.dev_edu.course.dto.CourseDiscountProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.pht.dev_edu.course.dto.CourseDiscountRequest;
import com.pht.dev_edu.course.dto.CourseDiscountResponse;
import com.pht.dev_edu.course.entity.CourseDiscountEntity;

@Mapper(componentModel = "spring")
public interface CourseDiscountMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    CourseDiscountEntity reqToEntity(CourseDiscountRequest couponRequest);

    @Mapping(target = "originalPrice", ignore = true)
    @Mapping(target = "discountDescription", source = "description")
    @Mapping(target = "courseTitle", ignore = true)
    @Mapping(target = "courseThumbnailUrl", ignore = true)
    @Mapping(target = "courseDescription", ignore = true)
    CourseDiscountResponse entityToRes(CourseDiscountEntity couponEntity);

    CourseDiscountResponse projectionToRes(CourseDiscountProjection projection);
}
