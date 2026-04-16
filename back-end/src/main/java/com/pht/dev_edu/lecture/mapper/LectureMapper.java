package com.pht.dev_edu.lecture.mapper;

import com.pht.dev_edu.lecture.dto.LectureProjection;
import com.pht.dev_edu.lecture.dto.LectureRequest;
import com.pht.dev_edu.lecture.dto.LectureResponse;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LectureMapper {
    @Mapping(target = "isCompleted", constant = "false")
    LectureResponse entityToResponse(LectureEntity lectureEntity);

    @Mapping(target = "isCompleted", source = "completed")
    LectureResponse projectionToResponse(LectureProjection lectureEntity);

    @Mapping(target = "uploadedAt", ignore = true)
    @Mapping(target = "lectureOrder", ignore = true)
    @Mapping(target = "durationInSeconds", constant = "-1")
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    LectureEntity reqToEntity(LectureRequest lectureResponse);
}
