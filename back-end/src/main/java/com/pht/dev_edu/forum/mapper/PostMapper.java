package com.pht.dev_edu.forum.mapper;

import com.pht.dev_edu.forum.dto.PostDetailProjection;
import com.pht.dev_edu.forum.dto.PostInfoProjection;
import com.pht.dev_edu.forum.dto.PostResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostMapper {
    PostResponse projectionToRes(PostDetailProjection projection);

    PostResponse infoToRes(PostInfoProjection info);
}
