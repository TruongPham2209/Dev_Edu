package com.pht.dev_edu.user.service;

import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.ProviderEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.FileContentTypeUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.user.entity.UserEntity;
import com.pht.dev_edu.user.repo.AuthProviderRepository;
import com.pht.dev_edu.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ProfileServiceImpl implements ProfileService {
    UserRepository userRepository;
    AuthProviderRepository authProviderRepository;

    Executor executor;
    UserService userService;
    FileService fileService;
    PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        if (oldPassword.equals(newPassword)) {
            throw new BadRequestException("New password must be different from old password");
        }

        // Validate new password by regex pattern
        if (!newPassword.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")) {
            throw new BadRequestException("New password must be at least 8 characters long and include uppercase, lowercase, number, and special character");
        }

        var user = userService.findByUsername(username);
        if (user == null) {
            throw new DataNotFoundException("User not found with username: " + username);
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        updateUserCache(user);
    }

    @Override
    @Transactional
    public void setUsernameForGoogleLogin(String email, String username) {
        var user = userService.findByEmail(email);
        if (user == null) {
            throw new DataNotFoundException("User not found with email: " + email);
        }

        if (user.getUsername() != null) {
            throw new BadRequestException("Username is already set for this user");
        }

        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username already exists");
        }

        if (!authProviderRepository.existsByUserIdAndProviderIdAndProvider(
                user.getId(),
                email,
                ProviderEnum.GOOGLE
        )) {
            throw new BadRequestException("No Google login found for this email");
        }

        user.setUsername(username);
        userRepository.save(user);

        updateUserCache(user);
    }

    @Override
    @Transactional
    public String updateAvatar(String username, String avatarObjectKey) {
        var user = userService.findByUsername(username);
        if (user == null) {
            throw new DataNotFoundException("User not found with username: " + username);
        }

        var fileInfo = fileService.getFileInfo(username, avatarObjectKey);
        if (fileInfo == null) {
            throw new DataNotFoundException("File not found with object key: " + avatarObjectKey);
        }

        boolean isImageContentType = FileContentTypeUtils.isValidContentType(fileInfo.getContentType(), FileContentTypeUtils.FileType.IMAGE);
        if (!isImageContentType) {
            throw new BadRequestException("File must be an image");
        }

        if (fileInfo.getPublicUrl() == null) {
            throw new DataNotFoundException("Public URL not found for file with object key: " + avatarObjectKey);
        }

        user.setAvatarUrl(fileInfo.getPublicUrl());
        userRepository.save(user);

        updateUserCache(user);
        return fileInfo.getPublicUrl();
    }

    private void updateUserCache(UserEntity user) {
        TransactionUtils.runAfterCommitAsync(() -> {
            RedisUtils.updateCache(
                    RedisPrefixConstant.USER_USERNAME_PREFIX + user.getUsername(),
                    user,
                    RedisDurationConstant.USER_DATA_DURATION
            );

            RedisUtils.updateCache(
                    RedisPrefixConstant.USER_EMAIL_PREFIX + user.getEmail(),
                    user,
                    RedisDurationConstant.USER_DATA_DURATION
            );
        }, executor);
    }
}
