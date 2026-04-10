package com.pht.dev_edu.lecture.mapper;

import com.pht.dev_edu.lecture.dto.CommentRequest;
import com.pht.dev_edu.lecture.dto.CommentResponse;
import com.pht.dev_edu.lecture.entity.LectureCommentEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    LectureCommentEntity reqToEntity(CommentRequest req);

    CommentResponse entityToRes(LectureCommentEntity entity);
}
