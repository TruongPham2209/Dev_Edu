package com.pht.dev_edu.user.service;

import com.pht.dev_edu.user.dto.RegisterUser;
import com.pht.dev_edu.user.entity.UserEntity;

import java.util.List;

public interface UserService {
    UserEntity findByUsername(String username); // Cached

    UserEntity findByEmail(String email); // Cached

    void registerUser(RegisterUser registerUser);

    void batchRegisterUsers(List<RegisterUser> registerUsers);

    void changePassword(String username, String oldPassword, String newPassword);

    void setUsernameForGoogleLogin(String email, String username);

    String updateAvatar(String username, String avatarObjectKey);
}
