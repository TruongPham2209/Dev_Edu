package com.pht.dev_edu.course.mapper;

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

    @Mapping(target = "lecturers", constant = "new ArrayList<>()")
    CourseResponse entityToRes(CourseEntity entity);
}
