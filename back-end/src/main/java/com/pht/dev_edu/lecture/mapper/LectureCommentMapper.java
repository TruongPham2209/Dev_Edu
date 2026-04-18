package com.pht.dev_edu.lecture.mapper;

import com.pht.dev_edu.lecture.dto.CommentRequest;
import com.pht.dev_edu.lecture.dto.CommentResponse;
import com.pht.dev_edu.lecture.entity.LectureCommentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
@Named("lectureCommentMapper")
public interface LectureCommentMapper {
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "rootCommentId", ignore = true)
    @Mapping(target = "replyToCommentId", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "depth", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    LectureCommentEntity reqToEntity(CommentRequest req);

    @Mapping(target = "replyCount", ignore = true)
    @Mapping(target = "isMine", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    CommentResponse entityToRes(LectureCommentEntity entity);

    @Mapping(target = "rootCommentId", ignore = true)
    @Mapping(target = "parentCommentId", ignore = true)
    @Mapping(target = "isMine", ignore = true)
    @Mapping(target = "depth", ignore = true)
    CommentResponse projectionToRes(com.pht.dev_edu.lecture.dto.CommentProjection projection);
}
