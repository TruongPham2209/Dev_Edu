package com.pht.dev_edu.user.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.pht.dev_edu.user.dto.UserInfoProjection;
import com.pht.dev_edu.user.dto.UserInfoResponse;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "role", ignore = true)
    UserInfoResponse projectionToRes(UserInfoProjection projection);
}
