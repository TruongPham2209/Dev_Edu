package com.pht.dev_edu.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

/*
 * <analysis>
 * UserServiceImpl
 * - findByUsername(String username)
 *   - branches: RedisUtils.getOptionalDataFromCacheOrDb delegates to cache/db internally (static call)
 *   - paths: [P1: delegates to RedisUtils and returns result]
 *   - planned tests: [shouldReturnUserWhenFindByUsername -> P1]
 *
 * - findByEmail(String email)
 *   - branches: RedisUtils.getOptionalDataFromCacheOrDb delegates to cache/db internally (static call)
 *   - paths: [P1: delegates to RedisUtils and returns result]
 *   - planned tests: [shouldReturnUserWhenFindByEmail -> P1]
 *
 * - searchUsers(String keyword, RoleEnum role, Pageable pageable)
 *   - branches: role == ADMIN -> setCourseCount(0); role != ADMIN -> courseCount unchanged
 *   - paths:
 *       [P1: role is ADMIN -> courseCount set to 0]
 *       [P2: role is not ADMIN -> courseCount kept from projection]
 *   - planned tests:
 *       [shouldSetCourseCountToZeroWhenRoleIsAdmin -> P1]
 *       [shouldKeepCourseCountWhenRoleIsNotAdmin -> P2]
 *
 * - registerUser(RegisterUser registerUser)
 *   - branches:
 *       if existsByUsernameInOrEmailIn -> throw BadRequestException
 *       else -> convertToUserEntity, save, sendWelcomeEmail via TransactionUtils
 *   - paths:
 *       [P1: username/email already exists -> BadRequestException]
 *       [P2: new user -> save + schedule welcome email]
 *   - planned tests:
 *       [shouldThrowBadRequestExceptionWhenUsernameOrEmailAlreadyExists -> P1]
 *       [shouldSaveUserAndScheduleWelcomeEmailWhenRegistrationSucceeds -> P2]
 *
 * - batchRegisterUsers(List<RegisterUser> registerUsers)
 *   - branches:
 *       if any user has null role -> BadRequestException
 *       if duplicate usernames or emails in list -> BadRequestException
 *       if existsByUsernameInOrEmailIn -> BadRequestException
 *       else -> convertToUserEntity, saveAll, schedule welcome emails
 *   - paths:
 *       [P1: any role is null -> BadRequestException]
 *       [P2: duplicate usernames in request -> BadRequestException]
 *       [P3: duplicate emails in request -> BadRequestException]
 *       [P4: existing username/email in DB -> BadRequestException]
 *       [P5: all valid -> saveAll + schedule emails]
 *   - Note: P2 and P3 share the same guard clause (deduplication check on both usernames and emails).
 *           They are distinct inputs but the same branch. Testing both to validate both fields.
 *   - planned tests:
 *       [shouldThrowBadRequestWhenAnyUserHasNullRole -> P1]
 *       [shouldThrowBadRequestWhenDuplicateUsernamesInBatch -> P2]
 *       [shouldThrowBadRequestWhenDuplicateEmailsInBatch -> P3]
 *       [shouldThrowBadRequestWhenUsernameOrEmailAlreadyExistsInBatch -> P4]
 *       [shouldSaveAllUsersAndScheduleEmailsWhenBatchIsValid -> P5]
 *
 * - loadUserByUsername(String username)
 *   - branches:
 *       if findByUsername returns null -> UsernameNotFoundException
 *       else -> build UserDetails
 *   - paths:
 *       [P1: user not found -> UsernameNotFoundException]
 *       [P2: user found -> return UserDetails]
 *   - planned tests:
 *       [shouldThrowUsernameNotFoundExceptionWhenUserNotFound -> P1]
 *       [shouldReturnUserDetailsWhenUserExists -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for UserServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify all business logic implemented in UserServiceImpl.
 *
 * Test Scope
 * ----------
 * - findByUsername()
 * - findByEmail()
 * - searchUsers()
 * - registerUser()
 * - batchRegisterUsers()
 * - loadUserByUsername()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Normal execution (cache delegation, user registration, batch registration)
 * ✓ Invalid input (duplicate usernames/emails, null roles)
 * ✓ Null values (user not found from cache/db)
 * ✓ Exception paths (BadRequestException, DataNotFoundException, UsernameNotFoundException)
 * ✓ Branch conditions (role == ADMIN in searchUsers, deduplication logic in batch)
 * ✓ Interaction with dependencies (repository save, kafka, TransactionUtils)
 *
 * Mocked Dependencies
 * -------------------
 * - UserRepository
 * - RoleRepository
 * - UserQueryRepository
 * - Executor
 * - KafkaTemplate
 * - PasswordEncoder
 * - UserMapper
 * - RedisUtils (static)
 * - TransactionUtils (static)
 *
 * Not Covered
 * -----------
 * - Database integration
 * - Spring Context
 * - Redis cache integration
 * - Kafka message delivery
 * - Private method convertToUserEntity directly (tested through public methods)
 * - Private method sendWelcomeEmail directly (tested through TransactionUtils interaction)
 *
 * Notes
 * -----
 * Pure unit test. All collaborators are mocked. No real database used.
 * RedisUtils and TransactionUtils are mocked via MockedStatic since they use static methods.
 */

import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.user.dto.RegisterUser;
import com.pht.dev_edu.user.dto.UserInfoProjection;
import com.pht.dev_edu.user.dto.UserInfoResponse;
import com.pht.dev_edu.user.entity.RoleEntity;
import com.pht.dev_edu.user.entity.UserEntity;
import com.pht.dev_edu.user.mapper.UserMapper;
import com.pht.dev_edu.user.repo.RoleRepository;
import com.pht.dev_edu.user.repo.UserQueryRepository;
import com.pht.dev_edu.user.repo.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

        @Mock
        private UserRepository userRepository;
        @Mock
        private RoleRepository roleRepository;
        @Mock
        private UserQueryRepository userQueryRepository;
        @Mock
        private Executor executor;
        @Mock
        private KafkaTemplate<String, Object> kafkaTemplate;
        @Mock
        private PasswordEncoder passwordEncoder;
        @Mock
        private UserMapper userMapper;

        @InjectMocks
        private UserServiceImpl userService;

        private MockedStatic<RedisUtils> redisUtilsMock;
        private MockedStatic<TransactionUtils> transactionUtilsMock;

        private static final UUID USER_ID = UUID.randomUUID();
        private static final String USERNAME = "testuser";
        private static final String EMAIL = "test@example.com";
        private static final String PASSWORD = "Password1!";
        private static final String FULL_NAME = "Test User";
        private static final String ENCODED_PASSWORD = "encodedPassword123";

        @BeforeEach
        void setUp() {
                redisUtilsMock = mockStatic(RedisUtils.class);
                transactionUtilsMock = mockStatic(TransactionUtils.class);
        }

        @AfterEach
        void tearDown() {
                redisUtilsMock.close();
                transactionUtilsMock.close();
        }

        // ==================== Helper Methods ====================

        private UserEntity buildUserEntity() {
                return UserEntity.builder()
                                .id(USER_ID)
                                .username(USERNAME)
                                .email(EMAIL)
                                .fullName(FULL_NAME)
                                .password(ENCODED_PASSWORD)
                                .roles(Set.of(buildRoleEntity(RoleEnum.STUDENT)))
                                .build();
        }

        private RoleEntity buildRoleEntity(RoleEnum roleName) {
                return RoleEntity.builder()
                                .id(UUID.randomUUID())
                                .name(roleName)
                                .build();
        }

        private RegisterUser buildRegisterUser(String username, String email, RoleEnum role) {
                return RegisterUser.builder()
                                .username(username)
                                .email(email)
                                .password(PASSWORD)
                                .fullName(FULL_NAME)
                                .role(role)
                                .build();
        }

        // ==================== findByUsername ====================

        @Test
        @DisplayName("findByUsername - should delegate to RedisUtils and return user")
        void shouldReturnUserWhenFindByUsername() {
                // Arrange
                UserEntity expectedUser = buildUserEntity();
                String expectedCacheKey = RedisPrefixConstant.USER_USERNAME_PREFIX + USERNAME;

                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(expectedCacheKey),
                                eq(UserEntity.class),
                                any(),
                                eq(RedisDurationConstant.USER_DATA_DURATION))).thenReturn(expectedUser);

                // Act
                UserEntity result = userService.findByUsername(USERNAME);

                // Assert
                assertThat(result).isEqualTo(expectedUser);

                // Verify
                redisUtilsMock.verify(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(expectedCacheKey),
                                eq(UserEntity.class),
                                any(),
                                eq(RedisDurationConstant.USER_DATA_DURATION)));
        }

        // ==================== findByEmail ====================

        @Test
        @DisplayName("findByEmail - should delegate to RedisUtils and return user")
        void shouldReturnUserWhenFindByEmail() {
                // Arrange
                UserEntity expectedUser = buildUserEntity();
                String expectedCacheKey = RedisPrefixConstant.USER_EMAIL_PREFIX + EMAIL;

                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(expectedCacheKey),
                                eq(UserEntity.class),
                                any(),
                                eq(RedisDurationConstant.USER_DATA_DURATION))).thenReturn(expectedUser);

                // Act
                UserEntity result = userService.findByEmail(EMAIL);

                // Assert
                assertThat(result).isEqualTo(expectedUser);

                // Verify
                redisUtilsMock.verify(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(expectedCacheKey),
                                eq(UserEntity.class),
                                any(),
                                eq(RedisDurationConstant.USER_DATA_DURATION)));
        }

        // ==================== searchUsers ====================

        @Test
        @DisplayName("searchUsers - should set courseCount to 0 when role is ADMIN")
        void shouldSetCourseCountToZeroWhenRoleIsAdmin() {
                // Arrange
                Pageable pageable = PageRequest.of(0, 10);
                UserInfoProjection projection = new UserInfoProjection(
                                USER_ID, USERNAME, FULL_NAME, null, EMAIL, 5, 3);
                Page<UserInfoProjection> page = new PageImpl<>(List.of(projection), pageable, 1);

                when(userQueryRepository.searchUsers("keyword", RoleEnum.ADMIN, pageable)).thenReturn(page);

                UserInfoResponse mappedResponse = UserInfoResponse.builder()
                                .id(USER_ID)
                                .username(USERNAME)
                                .fullName(FULL_NAME)
                                .email(EMAIL)
                                .courseCount(5)
                                .postedPosts(3)
                                .build();
                when(userMapper.projectionToRes(projection)).thenReturn(mappedResponse);

                // Act
                CustomPaging<UserInfoResponse> result = userService.searchUsers("keyword", RoleEnum.ADMIN, pageable);

                // Assert
                assertThat(result.getContents()).hasSize(1);
                UserInfoResponse firstResult = result.getContents().iterator().next();
                assertThat(firstResult.getCourseCount()).isZero();
                assertThat(firstResult.getRole()).isEqualTo(RoleEnum.ADMIN);

                // Verify
                verify(userQueryRepository).searchUsers("keyword", RoleEnum.ADMIN, pageable);
                verify(userMapper).projectionToRes(projection);
        }

        @Test
        @DisplayName("searchUsers - should keep courseCount when role is not ADMIN")
        void shouldKeepCourseCountWhenRoleIsNotAdmin() {
                // Arrange
                Pageable pageable = PageRequest.of(0, 10);
                UserInfoProjection projection = new UserInfoProjection(
                                USER_ID, USERNAME, FULL_NAME, null, EMAIL, 7, 3);
                Page<UserInfoProjection> page = new PageImpl<>(List.of(projection), pageable, 1);

                when(userQueryRepository.searchUsers("keyword", RoleEnum.STUDENT, pageable)).thenReturn(page);

                UserInfoResponse mappedResponse = UserInfoResponse.builder()
                                .id(USER_ID)
                                .username(USERNAME)
                                .fullName(FULL_NAME)
                                .email(EMAIL)
                                .courseCount(7)
                                .postedPosts(3)
                                .build();
                when(userMapper.projectionToRes(projection)).thenReturn(mappedResponse);

                // Act
                CustomPaging<UserInfoResponse> result = userService.searchUsers("keyword", RoleEnum.STUDENT, pageable);

                // Assert
                assertThat(result.getContents()).hasSize(1);
                UserInfoResponse firstResult = result.getContents().iterator().next();
                assertThat(firstResult.getCourseCount()).isEqualTo(7);
                assertThat(firstResult.getRole()).isEqualTo(RoleEnum.STUDENT);

                // Verify
                verify(userQueryRepository).searchUsers("keyword", RoleEnum.STUDENT, pageable);
        }

        // ==================== registerUser ====================

        @Test
        @DisplayName("registerUser - should throw BadRequestException when username or email already exists")
        void shouldThrowBadRequestExceptionWhenUsernameOrEmailAlreadyExists() {
                // Arrange
                RegisterUser registerUser = buildRegisterUser(USERNAME, EMAIL, RoleEnum.STUDENT);
                when(userRepository.existsByUsernameInOrEmailIn(
                                List.of(USERNAME), List.of(EMAIL))).thenReturn(true);

                // Act & Assert
                assertThatThrownBy(() -> userService.registerUser(registerUser))
                                .isInstanceOf(BadRequestException.class)
                                .hasMessageContaining("Username or email already exists");

                // Verify
                verify(userRepository).existsByUsernameInOrEmailIn(List.of(USERNAME), List.of(EMAIL));
                verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("registerUser - should save user and schedule welcome email on successful registration")
        void shouldSaveUserAndScheduleWelcomeEmailWhenRegistrationSucceeds() {
                // Arrange
                RegisterUser registerUser = buildRegisterUser(USERNAME, EMAIL, RoleEnum.STUDENT);
                RoleEntity roleEntity = buildRoleEntity(RoleEnum.STUDENT);

                when(userRepository.existsByUsernameInOrEmailIn(
                                List.of(USERNAME), List.of(EMAIL))).thenReturn(false);

                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(RedisPrefixConstant.ROLE_PREFIX + RoleEnum.STUDENT),
                                eq(RoleEntity.class),
                                any(),
                                eq(RedisDurationConstant.ROLE_DATA_DURATION))).thenReturn(roleEntity);

                when(passwordEncoder.encode(PASSWORD)).thenReturn(ENCODED_PASSWORD);

                // Act
                userService.registerUser(registerUser);

                // Assert & Verify
                verify(userRepository).save(argThat(user -> user.getUsername().equals(USERNAME) &&
                                user.getEmail().equals(EMAIL) &&
                                user.getPassword().equals(ENCODED_PASSWORD)));

                transactionUtilsMock
                                .verify(() -> TransactionUtils.runAfterCommitAsync(any(Runnable.class), eq(executor)));
        }

        // ==================== batchRegisterUsers ====================

        @Test
        @DisplayName("batchRegisterUsers - should throw BadRequestException when any user has null role")
        void shouldThrowBadRequestWhenAnyUserHasNullRole() {
                // Arrange
                List<RegisterUser> users = List.of(
                                buildRegisterUser("user1", "user1@test.com", RoleEnum.STUDENT),
                                buildRegisterUser("user2", "user2@test.com", null));

                // Act & Assert
                assertThatThrownBy(() -> userService.batchRegisterUsers(users))
                                .isInstanceOf(BadRequestException.class)
                                .hasMessageContaining("All users must have a role");

                // Verify
                verify(userRepository, never()).saveAll(any());
        }

        @Test
        @DisplayName("batchRegisterUsers - should throw BadRequestException when duplicate usernames in batch")
        void shouldThrowBadRequestWhenDuplicateUsernamesInBatch() {
                // Arrange
                List<RegisterUser> users = List.of(
                                buildRegisterUser("user1", "user1@test.com", RoleEnum.STUDENT),
                                buildRegisterUser("user1", "user2@test.com", RoleEnum.STUDENT));

                // Act & Assert
                assertThatThrownBy(() -> userService.batchRegisterUsers(users))
                                .isInstanceOf(BadRequestException.class)
                                .hasMessageContaining("Duplicate usernames or emails in the request");

                // Verify
                verify(userRepository, never()).saveAll(any());
        }

        @Test
        @DisplayName("batchRegisterUsers - should throw BadRequestException when duplicate emails in batch")
        void shouldThrowBadRequestWhenDuplicateEmailsInBatch() {
                // Arrange
                List<RegisterUser> users = List.of(
                                buildRegisterUser("user1", "same@test.com", RoleEnum.STUDENT),
                                buildRegisterUser("user2", "same@test.com", RoleEnum.LECTURER));

                // Act & Assert
                assertThatThrownBy(() -> userService.batchRegisterUsers(users))
                                .isInstanceOf(BadRequestException.class)
                                .hasMessageContaining("Duplicate usernames or emails in the request");

                // Verify
                verify(userRepository, never()).saveAll(any());
        }

        @Test
        @DisplayName("batchRegisterUsers - should throw BadRequestException when username or email already exists in DB")
        void shouldThrowBadRequestWhenUsernameOrEmailAlreadyExistsInBatch() {
                // Arrange
                List<RegisterUser> users = List.of(
                                buildRegisterUser("user1", "user1@test.com", RoleEnum.STUDENT),
                                buildRegisterUser("user2", "user2@test.com", RoleEnum.LECTURER));
                when(userRepository.existsByUsernameInOrEmailIn(
                                List.of("user1", "user2"), List.of("user1@test.com", "user2@test.com")))
                                .thenReturn(true);

                // Act & Assert
                assertThatThrownBy(() -> userService.batchRegisterUsers(users))
                                .isInstanceOf(BadRequestException.class)
                                .hasMessageContaining("One or more usernames or emails already exist");

                // Verify
                verify(userRepository, never()).saveAll(any());
        }

        @Test
        @DisplayName("batchRegisterUsers - should save all users and schedule emails when batch is valid")
        void shouldSaveAllUsersAndScheduleEmailsWhenBatchIsValid() {
                // Arrange
                RoleEntity studentRole = buildRoleEntity(RoleEnum.STUDENT);
                RoleEntity lecturerRole = buildRoleEntity(RoleEnum.LECTURER);

                List<RegisterUser> users = List.of(
                                buildRegisterUser("user1", "user1@test.com", RoleEnum.STUDENT),
                                buildRegisterUser("user2", "user2@test.com", RoleEnum.LECTURER));

                when(userRepository.existsByUsernameInOrEmailIn(
                                List.of("user1", "user2"), List.of("user1@test.com", "user2@test.com")))
                                .thenReturn(false);

                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(RedisPrefixConstant.ROLE_PREFIX + RoleEnum.STUDENT),
                                eq(RoleEntity.class),
                                any(),
                                eq(RedisDurationConstant.ROLE_DATA_DURATION))).thenReturn(studentRole);

                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(RedisPrefixConstant.ROLE_PREFIX + RoleEnum.LECTURER),
                                eq(RoleEntity.class),
                                any(),
                                eq(RedisDurationConstant.ROLE_DATA_DURATION))).thenReturn(lecturerRole);

                when(passwordEncoder.encode(PASSWORD)).thenReturn(ENCODED_PASSWORD);

                // Act
                userService.batchRegisterUsers(users);

                // Assert & Verify
                verify(userRepository).saveAll(argThat(entities -> {
                        List<UserEntity> list = new ArrayList<>();
                        entities.forEach(list::add);
                        return list.size() == 2;
                }));

                transactionUtilsMock
                                .verify(() -> TransactionUtils.runAfterCommitAsync(any(Runnable.class), eq(executor)));
        }

        // ==================== loadUserByUsername ====================

        @Test
        @DisplayName("loadUserByUsername - should throw UsernameNotFoundException when user not found")
        void shouldThrowUsernameNotFoundExceptionWhenUserNotFound() {
                // Arrange
                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(RedisPrefixConstant.USER_USERNAME_PREFIX + USERNAME),
                                eq(UserEntity.class),
                                any(),
                                eq(RedisDurationConstant.USER_DATA_DURATION))).thenReturn(null);

                // Act & Assert
                assertThatThrownBy(() -> userService.loadUserByUsername(USERNAME))
                                .isInstanceOf(UsernameNotFoundException.class)
                                .hasMessageContaining("User not found with username: " + USERNAME);

                // Verify
                redisUtilsMock.verify(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(RedisPrefixConstant.USER_USERNAME_PREFIX + USERNAME),
                                eq(UserEntity.class),
                                any(),
                                eq(RedisDurationConstant.USER_DATA_DURATION)));
        }

        @Test
        @DisplayName("loadUserByUsername - should return UserDetails when user exists")
        void shouldReturnUserDetailsWhenUserExists() {
                // Arrange
                UserEntity userEntity = buildUserEntity();

                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(RedisPrefixConstant.USER_USERNAME_PREFIX + USERNAME),
                                eq(UserEntity.class),
                                any(),
                                eq(RedisDurationConstant.USER_DATA_DURATION))).thenReturn(userEntity);

                // Act
                UserDetails result = userService.loadUserByUsername(USERNAME);

                // Assert
                assertThat(result).isNotNull();
                assertThat(result.getUsername()).isEqualTo(USERNAME);
                assertThat(result.getPassword()).isEqualTo(ENCODED_PASSWORD);
                assertThat(result.isAccountNonExpired()).isTrue();
                assertThat(result.isAccountNonLocked()).isTrue();
                assertThat(result.isCredentialsNonExpired()).isTrue();
                assertThat(result.isEnabled()).isTrue();

                // Verify
                redisUtilsMock.verify(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                eq(RedisPrefixConstant.USER_USERNAME_PREFIX + USERNAME),
                                eq(UserEntity.class),
                                any(),
                                eq(RedisDurationConstant.USER_DATA_DURATION)));
        }
}
