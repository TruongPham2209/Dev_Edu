package com.pht.dev_edu.user.service;

import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.ProviderEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.FileContentTypeUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.user.dto.MailPayload;
import com.pht.dev_edu.user.dto.RegisterUser;
import com.pht.dev_edu.user.entity.RoleEntity;
import com.pht.dev_edu.user.entity.UserEntity;
import com.pht.dev_edu.user.repo.AuthProviderRepository;
import com.pht.dev_edu.user.repo.RoleRepository;
import com.pht.dev_edu.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService, UserDetailsService {
    UserRepository userRepository;
    AuthProviderRepository authProviderRepository;
    RoleRepository roleRepository;

    Executor executor;
    KafkaTemplate<String, Object> kafkaTemplate;
    FileService fileService;
    PasswordEncoder passwordEncoder;

    @Override
    public UserEntity findByUsername(String username) {
        String cacheKey = RedisPrefixConstant.USER_USERNAME_PREFIX + username;
        return RedisUtils.getOptionalDataFromCacheOrDb(
                cacheKey,
                UserEntity.class,
                () -> userRepository.findByUsername(username),
                RedisDurationConstant.USER_DATA_DURATION
        );
    }

    @Override
    public UserEntity findByEmail(String email) {
        String cacheKey = RedisPrefixConstant.USER_EMAIL_PREFIX + email;
        return RedisUtils.getOptionalDataFromCacheOrDb(
                cacheKey,
                UserEntity.class,
                () -> userRepository.findByEmail(email),
                RedisDurationConstant.USER_DATA_DURATION
        );
    }

    @Override
    @Transactional
    public void registerUser(RegisterUser registerUser) {
        if (userRepository.existsByUsernameInOrEmailIn(
                List.of(registerUser.getUsername()),
                List.of(registerUser.getEmail())
        )) {
            throw new BadRequestException("Username or email already exists");
        }

        var userEntity = convertToUserEntity(List.of(registerUser)).getFirst();
        userRepository.save(userEntity);

        TransactionUtils.runAfterCommitAsync(() -> sendWelcomeEmail(userEntity), executor);
    }

    @Override
    @Transactional
    public void batchRegisterUsers(List<RegisterUser> registerUsers) {
        var usernames = registerUsers.stream().map(RegisterUser::getUsername).toList();
        var emails = registerUsers.stream().map(RegisterUser::getEmail).toList();
        if (registerUsers.stream().anyMatch(user -> user.getRole() == null)) {
            throw new BadRequestException("All users must have a role");
        }

        if (usernames.size() != (new HashSet<>(usernames)).size() || emails.size() != (new HashSet<>(emails)).size()) {
            throw new BadRequestException("Duplicate usernames or emails in the request");
        }

        if (userRepository.existsByUsernameInOrEmailIn(usernames, emails)) {
            throw new BadRequestException("One or more usernames or emails already exist");
        }

        var userEntities = convertToUserEntity(registerUsers);
        userRepository.saveAll(userEntities);

        TransactionUtils.runAfterCommitAsync(() -> {
            for (var user : userEntities) {
                sendWelcomeEmail(user);
            }
        }, executor);
    }

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

        var user = findByUsername(username);
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
        var user = findByEmail(email);
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
        var user = findByUsername(username);
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

    @NotNull
    @Override
    public UserDetails loadUserByUsername(@NotNull String username) throws UsernameNotFoundException {
        var user = findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getAuthorities())
                .accountExpired(!user.isAccountNonExpired())
                .accountLocked(!user.isAccountNonLocked())
                .credentialsExpired(!user.isCredentialsNonExpired())
                .disabled(!user.isEnabled())
                .build();
    }

    private List<UserEntity> convertToUserEntity(List<RegisterUser> registerUsers) {
        List<RoleEntity> roles = new ArrayList<>();
        var roleNames = registerUsers.stream()
                .map(RegisterUser::getRole)
                .toList();
        for (var roleName : roleNames) {
            String cacheKey = RedisPrefixConstant.ROLE_PREFIX + roleName;
            var role = RedisUtils.getOptionalDataFromCacheOrDb(
                    cacheKey,
                    RoleEntity.class,
                    () -> roleRepository.findByName(roleName),
                    RedisDurationConstant.ROLE_DATA_DURATION
            );
            if (role == null) {
                throw new DataNotFoundException("Role not found: " + roleName);
            }
            roles.add(role);
        }

        return registerUsers.stream()
                .map(registerUser -> {
                    var role = roles.stream()
                            .filter(r -> r.getName().equals(registerUser.getRole()))
                            .findFirst()
                            .orElseThrow(() -> new BadRequestException("Role not found for user: " + registerUser.getUsername()));
                    return UserEntity.builder()
                            .username(registerUser.getUsername())
                            .email(registerUser.getEmail())
                            .fullName(registerUser.getFullName())
                            .password(passwordEncoder.encode(registerUser.getPassword()))
                            .roles(Set.of(role))
                            .build();
                })
                .toList();
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

    private void sendWelcomeEmail(UserEntity user) {
        var mailPayload = MailPayload.builder()
                .toMail(user.getEmail())
                .subject(MailPayload.Subject.WELCOME)
                .template(MailPayload.Template.WELCOME_TEMPLATE)
                .mailAttributes(Map.of(
                        "username", user.getUsername(),
                        "fullName", user.getFullName() != null ? user.getFullName() : user.getUsername()
                ))
                .build();
        kafkaTemplate.send(KafkaTopicConstant.MAIL_SEND_TOPIC, mailPayload);
    }
}
