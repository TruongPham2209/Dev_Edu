package com.pht.dev_edu.forum.mapper;

import com.pht.dev_edu.forum.dto.PostRequest;
import com.pht.dev_edu.forum.dto.PostVersionResponse;
import com.pht.dev_edu.forum.entity.PostVersionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PostVersionMapper {
    PostVersionResponse entityToRes(PostVersionEntity postVersionEntity);

    @Mapping(target = "versionNumber", constant = "0")
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "thumbUrl", ignore = true)
    @Mapping(target = "status", expression = "java(com.pht.dev_edu.forum.dto.PostStatus.PENDING)")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    PostVersionEntity reqToEntity(PostRequest postVersionResponse);
}
