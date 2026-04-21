package com.pht.dev_edu.course.mapper;

import com.pht.dev_edu.course.dto.ReviewRequest;
import com.pht.dev_edu.course.dto.ReviewResponse;
import com.pht.dev_edu.course.entity.CourseReviewEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    @Mapping(target = "username", source = "studentUsername")
    ReviewResponse entityToResponse(CourseReviewEntity entity);

    @Mapping(target = "studentUsername", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "comment", source = "content")
    CourseReviewEntity reqToEntity(ReviewRequest response);
}
