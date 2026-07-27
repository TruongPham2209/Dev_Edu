package com.pht.dev_edu.user.service;

/*
 * <analysis>
 * ProfileServiceImpl
 * - changePassword(String username, String oldPassword, String newPassword)
 *   - branches:
 *       if oldPassword.equals(newPassword) -> BadRequestException
 *       if !newPassword.matches(regex) -> BadRequestException
 *       if user == null (findByUsername) -> DataNotFoundException
 *       if !passwordEncoder.matches(oldPassword, user.getPassword()) -> BadRequestException
 *       else -> update password, save, updateUserCache
 *   - paths:
 *       [P1: oldPassword equals newPassword -> BadRequestException]
 *       [P2: newPassword does not match regex -> BadRequestException]
 *       [P3: user not found -> DataNotFoundException]
 *       [P4: old password incorrect -> BadRequestException]
 *       [P5: success -> password updated, saved, cache updated]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenOldAndNewPasswordsAreSame -> P1]
 *       [shouldThrowBadRequestWhenNewPasswordFailsRegex -> P2]
 *       [shouldThrowDataNotFoundWhenUserNotFoundForChangePassword -> P3]
 *       [shouldThrowBadRequestWhenOldPasswordIsIncorrect -> P4]
 *       [shouldChangePasswordSuccessfully -> P5]
 *
 * - setUsernameForGoogleLogin(String email, String username)
 *   - branches:
 *       if user == null (findByEmail) -> DataNotFoundException
 *       if user.getUsername() != null -> BadRequestException
 *       if userRepository.existsByUsername(username) -> BadRequestException
 *       if !authProviderRepository.existsByUserIdAndProviderIdAndProvider(...) -> BadRequestException
 *       else -> set username, save, updateUserCache
 *   - paths:
 *       [P1: user not found by email -> DataNotFoundException]
 *       [P2: username already set -> BadRequestException]
 *       [P3: username already exists in DB -> BadRequestException]
 *       [P4: no Google auth provider -> BadRequestException]
 *       [P5: success -> username set, saved, cache updated]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenUserNotFoundByEmail -> P1]
 *       [shouldThrowBadRequestWhenUsernameAlreadySet -> P2]
 *       [shouldThrowBadRequestWhenUsernameAlreadyExistsInDb -> P3]
 *       [shouldThrowBadRequestWhenNoGoogleProviderFound -> P4]
 *       [shouldSetUsernameForGoogleLoginSuccessfully -> P5]
 *
 * - updateAvatar(String username, String avatarObjectKey)
 *   - branches:
 *       if user == null -> DataNotFoundException
 *       if fileInfo == null -> DataNotFoundException
 *       if !isImageContentType -> BadRequestException
 *       if fileInfo.getPublicUrl() == null -> DataNotFoundException
 *       else -> update avatarUrl, save, updateUserCache, return publicUrl
 *   - paths:
 *       [P1: user not found -> DataNotFoundException]
 *       [P2: file not found -> DataNotFoundException]
 *       [P3: file not an image -> BadRequestException]
 *       [P4: publicUrl is null -> DataNotFoundException]
 *       [P5: success -> avatar updated, saved, cache updated, url returned]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenUserNotFoundForAvatarUpdate -> P1]
 *       [shouldThrowDataNotFoundWhenFileNotFound -> P2]
 *       [shouldThrowBadRequestWhenFileIsNotAnImage -> P3]
 *       [shouldThrowDataNotFoundWhenPublicUrlIsNull -> P4]
 *       [shouldUpdateAvatarSuccessfully -> P5]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for ProfileServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify all business logic implemented in ProfileServiceImpl.
 *
 * Test Scope
 * ----------
 * - changePassword()
 * - setUsernameForGoogleLogin()
 * - updateAvatar()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Normal execution (password change, username setting, avatar update)
 * ✓ Invalid input (same passwords, weak password regex, non-image file)
 * ✓ Null values (user not found, file not found, publicUrl null)
 * ✓ Exception paths (BadRequestException, DataNotFoundException)
 * ✓ Branch conditions (all guard clauses per method)
 * ✓ Interaction with dependencies (repository save, cache update via TransactionUtils)
 *
 * Mocked Dependencies
 * -------------------
 * - UserRepository
 * - AuthProviderRepository
 * - Executor
 * - UserService
 * - FileService
 * - PasswordEncoder
 * - RedisUtils (static)
 * - TransactionUtils (static)
 *
 * Not Covered
 * -----------
 * - Database integration
 * - Spring Context
 * - Redis cache integration
 * - Private method updateUserCache directly (tested through TransactionUtils interaction)
 *
 * Notes
 * -----
 * Pure unit test. All collaborators are mocked. No real database used.
 * RedisUtils and TransactionUtils are mocked via MockedStatic since they use static methods.
 */

import com.pht.dev_edu.common.dto.ProviderEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.user.entity.UserEntity;
import com.pht.dev_edu.user.repo.AuthProviderRepository;
import com.pht.dev_edu.user.repo.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private AuthProviderRepository authProviderRepository;
    @Mock
    private Executor executor;
    @Mock
    private UserService userService;
    @Mock
    private FileService fileService;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfileServiceImpl profileService;

    private MockedStatic<RedisUtils> redisUtilsMock;
    private MockedStatic<TransactionUtils> transactionUtilsMock;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String USERNAME = "testuser";
    private static final String EMAIL = "test@example.com";
    private static final String FULL_NAME = "Test User";
    private static final String OLD_PASSWORD = "OldPass1!";
    private static final String NEW_PASSWORD = "NewPass1!";
    private static final String ENCODED_OLD_PASSWORD = "encodedOldPassword";
    private static final String ENCODED_NEW_PASSWORD = "encodedNewPassword";
    private static final String AVATAR_OBJECT_KEY = "users/testuser/avatar.png";
    private static final String PUBLIC_URL = "https://cdn.example.com/avatar.png";

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
                .password(ENCODED_OLD_PASSWORD)
                .roles(Set.of())
                .build();
    }

    private UserEntity buildUserEntityWithoutUsername() {
        return UserEntity.builder()
                .id(USER_ID)
                .username(null)
                .email(EMAIL)
                .fullName(FULL_NAME)
                .password(ENCODED_OLD_PASSWORD)
                .roles(Set.of())
                .build();
    }

    private FileUploadResponse buildFileInfo(String contentType, String publicUrl) {
        return FileUploadResponse.builder()
                .originalFileName("avatar.png")
                .contentType(contentType)
                .fileSize(1024L)
                .objectKey(AVATAR_OBJECT_KEY)
                .publicUrl(publicUrl)
                .build();
    }

    // ==================== changePassword ====================

    @Test
    @DisplayName("changePassword - should throw BadRequestException when old and new passwords are the same")
    void shouldThrowBadRequestWhenOldAndNewPasswordsAreSame() {
        // Arrange
        String samePassword = "SamePass1!";

        // Act & Assert
        assertThatThrownBy(() -> profileService.changePassword(USERNAME, samePassword, samePassword))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("New password must be different from old password");

        // Verify
        verify(userService, never()).findByUsername(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword - should throw BadRequestException when new password fails regex validation")
    void shouldThrowBadRequestWhenNewPasswordFailsRegex() {
        // Arrange
        String weakPassword = "weak"; // no uppercase, no digit, no special char, too short

        // Act & Assert
        assertThatThrownBy(() -> profileService.changePassword(USERNAME, OLD_PASSWORD, weakPassword))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("New password must be at least 8 characters long");

        // Verify
        verify(userService, never()).findByUsername(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword - should throw DataNotFoundException when user not found")
    void shouldThrowDataNotFoundWhenUserNotFoundForChangePassword() {
        // Arrange
        when(userService.findByUsername(USERNAME)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> profileService.changePassword(USERNAME, OLD_PASSWORD, NEW_PASSWORD))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("User not found with username: " + USERNAME);

        // Verify
        verify(userService).findByUsername(USERNAME);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword - should throw BadRequestException when old password is incorrect")
    void shouldThrowBadRequestWhenOldPasswordIsIncorrect() {
        // Arrange
        UserEntity user = buildUserEntity();
        when(userService.findByUsername(USERNAME)).thenReturn(user);
        when(passwordEncoder.matches(OLD_PASSWORD, ENCODED_OLD_PASSWORD)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> profileService.changePassword(USERNAME, OLD_PASSWORD, NEW_PASSWORD))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Old password is incorrect");

        // Verify
        verify(userService).findByUsername(USERNAME);
        verify(passwordEncoder).matches(OLD_PASSWORD, ENCODED_OLD_PASSWORD);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword - should change password successfully")
    void shouldChangePasswordSuccessfully() {
        // Arrange
        UserEntity user = buildUserEntity();
        when(userService.findByUsername(USERNAME)).thenReturn(user);
        when(passwordEncoder.matches(OLD_PASSWORD, ENCODED_OLD_PASSWORD)).thenReturn(true);
        when(passwordEncoder.encode(NEW_PASSWORD)).thenReturn(ENCODED_NEW_PASSWORD);

        // Act
        profileService.changePassword(USERNAME, OLD_PASSWORD, NEW_PASSWORD);

        // Assert
        assertThat(user.getPassword()).isEqualTo(ENCODED_NEW_PASSWORD);

        // Verify
        verify(userRepository).save(user);
        transactionUtilsMock.verify(() -> TransactionUtils.runAfterCommitAsync(any(Runnable.class), eq(executor)));
    }

    // ==================== setUsernameForGoogleLogin ====================

    @Test
    @DisplayName("setUsernameForGoogleLogin - should throw DataNotFoundException when user not found by email")
    void shouldThrowDataNotFoundWhenUserNotFoundByEmail() {
        // Arrange
        when(userService.findByEmail(EMAIL)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> profileService.setUsernameForGoogleLogin(EMAIL, USERNAME))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("User not found with email: " + EMAIL);

        // Verify
        verify(userService).findByEmail(EMAIL);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("setUsernameForGoogleLogin - should throw BadRequestException when username already set")
    void shouldThrowBadRequestWhenUsernameAlreadySet() {
        // Arrange
        UserEntity user = buildUserEntity(); // has username set
        when(userService.findByEmail(EMAIL)).thenReturn(user);

        // Act & Assert
        assertThatThrownBy(() -> profileService.setUsernameForGoogleLogin(EMAIL, "newuser"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Username is already set for this user");

        // Verify
        verify(userService).findByEmail(EMAIL);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("setUsernameForGoogleLogin - should throw BadRequestException when username already exists in DB")
    void shouldThrowBadRequestWhenUsernameAlreadyExistsInDb() {
        // Arrange
        UserEntity user = buildUserEntityWithoutUsername();
        when(userService.findByEmail(EMAIL)).thenReturn(user);
        when(userRepository.existsByUsername(USERNAME)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> profileService.setUsernameForGoogleLogin(EMAIL, USERNAME))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Username already exists");

        // Verify
        verify(userRepository).existsByUsername(USERNAME);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("setUsernameForGoogleLogin - should throw BadRequestException when no Google provider found")
    void shouldThrowBadRequestWhenNoGoogleProviderFound() {
        // Arrange
        UserEntity user = buildUserEntityWithoutUsername();
        when(userService.findByEmail(EMAIL)).thenReturn(user);
        when(userRepository.existsByUsername(USERNAME)).thenReturn(false);
        when(authProviderRepository.existsByUserIdAndProviderIdAndProvider(
                USER_ID, EMAIL, ProviderEnum.GOOGLE
        )).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> profileService.setUsernameForGoogleLogin(EMAIL, USERNAME))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("No Google login found for this email");

        // Verify
        verify(authProviderRepository).existsByUserIdAndProviderIdAndProvider(USER_ID, EMAIL, ProviderEnum.GOOGLE);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("setUsernameForGoogleLogin - should set username successfully")
    void shouldSetUsernameForGoogleLoginSuccessfully() {
        // Arrange
        UserEntity user = buildUserEntityWithoutUsername();
        when(userService.findByEmail(EMAIL)).thenReturn(user);
        when(userRepository.existsByUsername(USERNAME)).thenReturn(false);
        when(authProviderRepository.existsByUserIdAndProviderIdAndProvider(
                USER_ID, EMAIL, ProviderEnum.GOOGLE
        )).thenReturn(true);

        // Act
        profileService.setUsernameForGoogleLogin(EMAIL, USERNAME);

        // Assert
        assertThat(user.getUsername()).isEqualTo(USERNAME);

        // Verify
        verify(userRepository).save(user);
        transactionUtilsMock.verify(() -> TransactionUtils.runAfterCommitAsync(any(Runnable.class), eq(executor)));
    }

    // ==================== updateAvatar ====================

    @Test
    @DisplayName("updateAvatar - should throw DataNotFoundException when user not found")
    void shouldThrowDataNotFoundWhenUserNotFoundForAvatarUpdate() {
        // Arrange
        when(userService.findByUsername(USERNAME)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> profileService.updateAvatar(USERNAME, AVATAR_OBJECT_KEY))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("User not found with username: " + USERNAME);

        // Verify
        verify(userService).findByUsername(USERNAME);
        verify(fileService, never()).getFileInfo(any(), any());
    }

    @Test
    @DisplayName("updateAvatar - should throw DataNotFoundException when file not found")
    void shouldThrowDataNotFoundWhenFileNotFound() {
        // Arrange
        UserEntity user = buildUserEntity();
        when(userService.findByUsername(USERNAME)).thenReturn(user);
        when(fileService.getFileInfo(USERNAME, AVATAR_OBJECT_KEY)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> profileService.updateAvatar(USERNAME, AVATAR_OBJECT_KEY))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("File not found with object key: " + AVATAR_OBJECT_KEY);

        // Verify
        verify(fileService).getFileInfo(USERNAME, AVATAR_OBJECT_KEY);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateAvatar - should throw BadRequestException when file is not an image")
    void shouldThrowBadRequestWhenFileIsNotAnImage() {
        // Arrange
        UserEntity user = buildUserEntity();
        FileUploadResponse fileInfo = buildFileInfo("application/pdf", PUBLIC_URL);

        when(userService.findByUsername(USERNAME)).thenReturn(user);
        when(fileService.getFileInfo(USERNAME, AVATAR_OBJECT_KEY)).thenReturn(fileInfo);

        // Act & Assert
        assertThatThrownBy(() -> profileService.updateAvatar(USERNAME, AVATAR_OBJECT_KEY))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("File must be an image");

        // Verify
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateAvatar - should throw DataNotFoundException when public URL is null")
    void shouldThrowDataNotFoundWhenPublicUrlIsNull() {
        // Arrange
        UserEntity user = buildUserEntity();
        FileUploadResponse fileInfo = buildFileInfo("image/png", null);

        when(userService.findByUsername(USERNAME)).thenReturn(user);
        when(fileService.getFileInfo(USERNAME, AVATAR_OBJECT_KEY)).thenReturn(fileInfo);

        // Act & Assert
        assertThatThrownBy(() -> profileService.updateAvatar(USERNAME, AVATAR_OBJECT_KEY))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Public URL not found for file with object key: " + AVATAR_OBJECT_KEY);

        // Verify
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateAvatar - should update avatar successfully and return public URL")
    void shouldUpdateAvatarSuccessfully() {
        // Arrange
        UserEntity user = buildUserEntity();
        FileUploadResponse fileInfo = buildFileInfo("image/png", PUBLIC_URL);

        when(userService.findByUsername(USERNAME)).thenReturn(user);
        when(fileService.getFileInfo(USERNAME, AVATAR_OBJECT_KEY)).thenReturn(fileInfo);

        // Act
        String result = profileService.updateAvatar(USERNAME, AVATAR_OBJECT_KEY);

        // Assert
        assertThat(result).isEqualTo(PUBLIC_URL);
        assertThat(user.getAvatarUrl()).isEqualTo(PUBLIC_URL);

        // Verify
        verify(userRepository).save(user);
        transactionUtilsMock.verify(() -> TransactionUtils.runAfterCommitAsync(any(Runnable.class), eq(executor)));
    }
}
