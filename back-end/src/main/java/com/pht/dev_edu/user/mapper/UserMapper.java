package com.pht.dev_edu.user.mapper;

import com.pht.dev_edu.user.dto.UserInfoProjection;
import com.pht.dev_edu.user.dto.UserInfoResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserInfoResponse projectionToRes(UserInfoProjection projection);
}
