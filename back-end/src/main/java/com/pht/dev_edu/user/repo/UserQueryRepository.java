package com.pht.dev_edu.user.repo;

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.user.dto.UserInfoProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserQueryRepository {
    Page<UserInfoProjection> searchUsers(String keyword, RoleEnum role, Pageable pageable);
}
