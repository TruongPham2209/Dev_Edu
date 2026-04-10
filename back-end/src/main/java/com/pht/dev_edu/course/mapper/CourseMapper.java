package com.pht.dev_edu.course.mapper;

import com.pht.dev_edu.course.dto.CourseRequest;
import com.pht.dev_edu.course.dto.CourseResponse;
import com.pht.dev_edu.course.entity.CourseEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    CourseEntity reqToEntity(CourseRequest req);

    CourseResponse entityToRes(CourseEntity entity);
}
