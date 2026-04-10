package com.pht.dev_edu.lecture.mapper;

import com.pht.dev_edu.lecture.dto.LectureRequest;
import com.pht.dev_edu.lecture.dto.LectureResponse;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LectureMapper {
    LectureResponse entityToResponse(LectureEntity lectureEntity);

    LectureEntity reqToEntity(LectureRequest lectureResponse);
}
