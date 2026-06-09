package com.pht.dev_edu.forum.mapper;

import com.pht.dev_edu.forum.dto.CommentProjection;
import com.pht.dev_edu.forum.dto.CommentRequest;
import com.pht.dev_edu.forum.dto.CommentResponse;
import com.pht.dev_edu.forum.entity.CommentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
@Named("forumCommentMapper")
public interface ForumCommentMapper {
    @Mapping(target = "isDeleted", constant = "false")
    @Mapping(target = "isMine", constant = "true")
    @Mapping(target = "replyCount", constant = "0")
    CommentResponse entityToRes(CommentEntity entity);

    @Mapping(target = "isMine", ignore = true)
    CommentResponse projectionToRes(CommentProjection projection);

    @Mapping(target = "rootCommentId", ignore = true)
    @Mapping(target = "depth", constant = "0")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "author", ignore = true)
    CommentEntity reqToEntity(CommentRequest request);
}
