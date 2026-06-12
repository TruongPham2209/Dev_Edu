package com.pht.dev_edu.course.mapper;

import com.pht.dev_edu.course.dto.CourseDetailProjection;
import com.pht.dev_edu.course.dto.CourseRequest;
import com.pht.dev_edu.course.dto.CourseResponse;
import com.pht.dev_edu.course.entity.CourseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    CourseEntity reqToEntity(CourseRequest req);

    @Mapping(target = "originalPrice", source = "price")
    @Mapping(target = "discountedPercentage", ignore = true)
    @Mapping(target = "discountedPrice", ignore = true)
    @Mapping(target = "avgReview", ignore = true)
    @Mapping(target = "totalReview", ignore = true)
    @Mapping(target = "totalEnrollment", ignore = true)
    @Mapping(target = "validTo", ignore = true)
    @Mapping(target = "lecturers", expression = "java(new java.util.ArrayList<>())")
    CourseResponse entityToRes(CourseEntity entity);

    @Mapping(target = "discountedPrice", ignore = true)
    @Mapping(target = "lecturers", expression = "java(new java.util.ArrayList<>())")
    CourseResponse projectionToRes(CourseDetailProjection projection);
}
