package com.pht.dev_edu.forum.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.pht.dev_edu.forum.dto.PostDetailProjection;
import com.pht.dev_edu.forum.dto.PostInfoProjection;
import com.pht.dev_edu.forum.dto.PostResponse;

@Mapper(componentModel = "spring")
public interface PostMapper {
    @Mapping(target = "isMine", ignore = true)
    PostResponse projectionToRes(PostDetailProjection projection);

    @Mapping(target = "isMine", constant = "true")
    @Mapping(target = "views", constant = "0")
    PostResponse infoToRes(PostInfoProjection info);
}
