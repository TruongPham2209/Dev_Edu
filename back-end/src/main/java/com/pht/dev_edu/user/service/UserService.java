package com.pht.dev_edu.user.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.user.dto.RegisterUser;
import com.pht.dev_edu.user.dto.UserInfoResponse;
import com.pht.dev_edu.user.entity.UserEntity;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    UserEntity findByUsername(String username); // Cached

    UserEntity findByEmail(String email); // Cached

    CustomPaging<UserInfoResponse> searchUsers(String keyword, RoleEnum role, Pageable  pageable);

    void registerUser(RegisterUser registerUser);

    void batchRegisterUsers(List<RegisterUser> registerUsers);
}
