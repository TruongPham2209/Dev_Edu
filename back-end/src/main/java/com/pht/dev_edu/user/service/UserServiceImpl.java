package com.pht.dev_edu.user.service;

import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.user.dto.MailPayload;
import com.pht.dev_edu.user.dto.RegisterUser;
import com.pht.dev_edu.user.dto.UserInfoResponse;
import com.pht.dev_edu.user.entity.RoleEntity;
import com.pht.dev_edu.user.entity.UserEntity;
import com.pht.dev_edu.user.mapper.UserMapper;
import com.pht.dev_edu.user.repo.RoleRepository;
import com.pht.dev_edu.user.repo.UserQueryRepository;
import com.pht.dev_edu.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Pageable;
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
    RoleRepository roleRepository;
    UserQueryRepository userQueryRepository;

    Executor executor;
    KafkaTemplate<String, Object> kafkaTemplate;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;

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
    public CustomPaging<UserInfoResponse> searchUsers(String keyword, RoleEnum role, Pageable pageable) {
        var userPage = userQueryRepository.searchUsers(keyword, role, pageable);

        return new CustomPaging<>(
                userPage,
                u -> {
                    var res = userMapper.projectionToRes(u);
                    res.setRole(role);

                    if (role == RoleEnum.ADMIN) {
                        res.setCourseCount(0);
                    }

                    return res;
                }
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
