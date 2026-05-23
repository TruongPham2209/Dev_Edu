package com.pht.dev_edu.user.service;

public interface ProfileService {
    void changePassword(String username, String oldPassword, String newPassword);

    void setUsernameForGoogleLogin(String email, String username);

    String updateAvatar(String username, String avatarObjectKey);
}
