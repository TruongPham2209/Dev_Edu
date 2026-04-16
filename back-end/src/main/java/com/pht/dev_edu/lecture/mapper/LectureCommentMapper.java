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
    @Mapping(target = "username", source = "")
    @Mapping(target = "rootCommentId", source = "")
    @Mapping(target = "replyToCommentId", source = "")
    @Mapping(target = "id", source = "")
    @Mapping(target = "depth", source = "")
    @Mapping(target = "deletedAt", source = "")
    @Mapping(target = "createdAt", source = "")
    LectureCommentEntity reqToEntity(CommentRequest req);

    @Mapping(target = "replyCount", source = "")
    @Mapping(target = "isMine", source = "")
    @Mapping(target = "isDeleted", source = "")
    CommentResponse entityToRes(LectureCommentEntity entity);
}
