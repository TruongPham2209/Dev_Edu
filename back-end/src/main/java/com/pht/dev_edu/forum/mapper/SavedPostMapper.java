package com.pht.dev_edu.forum.mapper;

import com.pht.dev_edu.forum.dto.SavedPostProjection;
import com.pht.dev_edu.forum.dto.SavedPostResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SavedPostMapper {
    SavedPostResponse projectionToRes(SavedPostProjection projection);
}
