package com.pht.dev_edu.enrollment.mapper;

import com.pht.dev_edu.enrollment.dto.CourseDiscountRequest;
import com.pht.dev_edu.enrollment.dto.CourseDiscountResponse;
import com.pht.dev_edu.enrollment.entity.CourseDiscountEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CourseDiscountMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    CourseDiscountEntity reqToEntity(CourseDiscountRequest couponRequest);

    @Mapping(target = "discountDescription", source = "description")
    @Mapping(target = "courseTitle", ignore = true)
    @Mapping(target = "courseThumbnailUrl", ignore = true)
    @Mapping(target = "courseDescription", ignore = true)
    CourseDiscountResponse entityToRes(CourseDiscountEntity couponEntity);

    CourseDiscountResponse projectionToRes(com.pht.dev_edu.enrollment.dto.CourseDiscountProjection projection);
}
