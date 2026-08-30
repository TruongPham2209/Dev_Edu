package com.pht.dev_edu.notification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.notification.dto.CachedNotification;
import com.pht.dev_edu.notification.dto.NotificationCategory;
import com.pht.dev_edu.notification.dto.NotificationResponse;
import com.pht.dev_edu.notification.dto.UnifiedNotificationProjection;
import com.pht.dev_edu.notification.dto.UnreadCountResponse;
import com.pht.dev_edu.notification.entity.NotificationGroupEntity;
import com.pht.dev_edu.notification.entity.NotificationGroupTargetEntity;
import com.pht.dev_edu.notification.entity.NotificationPersonalEntity;
import com.pht.dev_edu.notification.mapper.NotificationMapper;
import com.pht.dev_edu.notification.repo.NotificationGroupRepository;
import com.pht.dev_edu.notification.repo.NotificationGroupTargetRepository;
import com.pht.dev_edu.notification.repo.NotificationRepository;
import com.pht.dev_edu.user.entity.UserEntity;
import com.pht.dev_edu.user.service.UserService;

/*
 * <analysis>
 * NotificationServiceImpl
 * - getUnifiedNotifications(String username, Collection<String> userRoles, String nextCursor)
 *   - branches:
 *       userRoles extracted to empty roleEnums -> fallback roleNames to ["STUDENT"]
 *       userRoles valid -> map to RoleEnum names
 *       cursor null/blank -> default cursor
 *       cursor valid -> decode cursor
 *       fetch projections and map to NotificationResponse
 *   - paths:
 *       [P1: empty user roles defaults to STUDENT role, returns paged unified notifications]
 *       [P2: valid user roles returns paged unified notifications with parsed targetData]
 *   - planned tests:
 *       [shouldFallbackToStudentRoleWhenUserRolesIsEmpty -> P1]
 *       [shouldGetUnifiedNotificationsWithValidUserRoles -> P2]
 *
 * - getUnreadNotificationCounts(String username, Collection<String> userRoles)
 *   - branches:
 *       calculates sum of personal and group unread counts
 *   - paths:
 *       [P1: aggregate personal and group unread counts]
 *   - planned tests:
 *       [shouldGetUnreadNotificationCountsSuccessfully -> P1]
 *
 * - markNotificationAsRead(UUID id, NotificationCategory category, String username)
 *   - branches:
 *       category == GROUP -> call notificationGroupService.markGroupNotificationAsRead
 *       category != GROUP -> call notificationPersonalService.markAsRead
 *       invalidate Redis cache
 *   - paths:
 *       [P1: GROUP category notification marked as read and cache invalidated]
 *       [P2: PERSONAL category notification marked as read and cache invalidated]
 *   - planned tests:
 *       [shouldMarkGroupNotificationAsReadAndInvalidateCache -> P1]
 *       [shouldMarkPersonalNotificationAsReadAndInvalidateCache -> P2]
 *
 * - markAllNotificationsAsRead(String username, Collection<String> userRoles)
 *   - branches:
 *       always call notificationPersonalService.markAllAsRead
 *       userRoles is empty/null -> skip group notification mark all
 *       userRoles is present -> fetch user createdAt and call notificationGroupService.markAllAsReadBefore
 *   - paths:
 *       [P1: userRoles empty -> only mark personal notifications]
 *       [P2: userRoles present -> mark both personal and group notifications]
 *   - planned tests:
 *       [shouldOnlyMarkPersonalNotificationsWhenUserRolesIsEmpty -> P1]
 *       [shouldMarkAllPersonalAndGroupNotificationsWhenUserRolesIsPresent -> P2]
 *
 * - getCachedNotification(UUID id, NotificationCategory category)
 *   - branches:
 *       delegate to RedisUtils.getDataFromCacheOrDb supplier
 *       supplier logic (getNotificationFromDb):
 *         - category is null -> BadRequestException
 *         - category == GROUP:
 *             group entity not found -> DataNotFoundException
 *             group entity found -> return CachedNotification with target roles
 *         - category == PERSONAL (or other non-null):
 *             personal entity not found -> DataNotFoundException
 *             personal entity found -> return CachedNotification
 *   - paths:
 *       [P1: category is null -> BadRequestException]
 *       [P2: group notification not found -> DataNotFoundException]
 *       [P3: group notification found -> CachedNotification returned]
 *       [P4: personal notification not found -> DataNotFoundException]
 *       [P5: personal notification found -> CachedNotification returned]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenCategoryIsNullForCachedNotification -> P1]
 *       [shouldThrowDataNotFoundWhenGroupNotificationNotFoundInDb -> P2]
 *       [shouldReturnCachedGroupNotificationFromDb -> P3]
 *       [shouldThrowDataNotFoundWhenPersonalNotificationNotFoundInDb -> P4]
 *       [shouldReturnCachedPersonalNotificationFromDb -> P5]
 *
 * - deleteNotification(UUID id, String username)
 *   - branches:
 *       notification not found -> DataNotFoundException
 *       notification username does not match -> BadRequestException
 *       notification matches username -> delete entity and invalidate cache
 *   - paths:
 *       [P1: notification not found -> DataNotFoundException]
 *       [P2: username mismatch -> BadRequestException]
 *       [P3: valid owner -> delete notification and invalidate cache]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenDeletingNonExistentNotification -> P1]
 *       [shouldThrowBadRequestWhenUserIsNotNotificationOwner -> P2]
 *       [shouldDeleteNotificationSuccessfully -> P3]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for NotificationServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify unified notification orchestration, routing, caching, and read status
 * operations.
 *
 * Test Scope
 * ----------
 * - getUnifiedNotifications()
 * - getUnreadNotificationCounts()
 * - markNotificationAsRead()
 * - markAllNotificationsAsRead()
 * - getCachedNotification()
 * - deleteNotification()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Role default fallback (STUDENT) when no roles provided
 * ✓ Target data JSON parsing during unified projection mapping
 * ✓ Routing read requests to group vs personal notification services
 * ✓ User creation date lookup for timestamp-bounded group read status marking
 * ✓ Cache delegation and database fallback for CachedNotification
 * ✓ Ownership validation and cache invalidation during deletion
 *
 * Mocked Dependencies
 * -------------------
 * - NotificationRepository
 * - NotificationGroupRepository
 * - NotificationGroupTargetRepository
 * - UserService
 * - NotificationPersonalService
 * - NotificationGroupService
 * - NotificationMapper (Spy)
 * - ObjectMapper
 * - RedisUtils (static)
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private NotificationGroupRepository notificationGroupRepository;
    @Mock
    private NotificationGroupTargetRepository notificationGroupTargetRepository;
    @Mock
    private UserService userService;
    @Mock
    private NotificationPersonalService notificationPersonalService;
    @Mock
    private NotificationGroupService notificationGroupService;
    @Spy
    private NotificationMapper notificationMapper = Mappers.getMapper(NotificationMapper.class);
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private MockedStatic<RedisUtils> redisUtilsMock;

    private static final String USERNAME = "testuser";
    private static final UUID NOTIF_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        redisUtilsMock = mockStatic(RedisUtils.class);

        redisUtilsMock.when(() -> RedisUtils.getDataFromCacheOrDb(
                anyString(), any(), any(), any()))
                .thenAnswer(invocation -> {
                    Supplier<?> supplier = invocation.getArgument(2);
                    return supplier.get();
                });
    }

    @AfterEach
    void tearDown() {
        redisUtilsMock.close();
    }

    // ==================== getUnifiedNotifications ====================\

    @Test
    @DisplayName("getUnifiedNotifications - should fallback to STUDENT role when user roles is empty")
    void shouldFallbackToStudentRoleWhenUserRolesIsEmpty() {
        // Arrange
        UnifiedNotificationProjection projection = mock(UnifiedNotificationProjection.class);
        when(projection.getId()).thenReturn(NOTIF_ID);
        when(projection.getCategory()).thenReturn("PERSONAL");

        when(notificationRepository.findUnifiedNotificationsWithCursor(
                eq(USERNAME), eq(List.of("STUDENT")), any(), any(), eq(16)))
                .thenReturn(List.of(projection));

        // Act
        CustomPaging<NotificationResponse> result = notificationService.getUnifiedNotifications(
                USERNAME, Collections.emptyList(), null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContents()).hasSize(1);
        verify(notificationRepository).findUnifiedNotificationsWithCursor(
                eq(USERNAME), eq(List.of("STUDENT")), any(), any(), eq(16));
    }

    @Test
    @SuppressWarnings("unchecked")
    @DisplayName("getUnifiedNotifications - should get unified notifications with valid user roles")
    void shouldGetUnifiedNotificationsWithValidUserRoles() throws Exception {
        // Arrange
        UnifiedNotificationProjection projection = mock(UnifiedNotificationProjection.class);
        when(projection.getId()).thenReturn(NOTIF_ID);
        when(projection.getCategory()).thenReturn("GROUP");
        when(projection.getTargetData()).thenReturn("{\"COURSE\":\"123\"}");

        when(notificationRepository.findUnifiedNotificationsWithCursor(
                eq(USERNAME), eq(List.of("ADMIN")), any(), any(), eq(16)))
                .thenReturn(List.of(projection));

        // Act
        CustomPaging<NotificationResponse> result = notificationService.getUnifiedNotifications(
                USERNAME, List.of("ROLE_ADMIN"), null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContents()).hasSize(1);
        verify(objectMapper).readValue(eq("{\"COURSE\":\"123\"}"), any(TypeReference.class));
    }

    // ==================== getUnreadNotificationCounts ====================\

    @Test
    @DisplayName("getUnreadNotificationCounts - should get unread notification counts successfully")
    void shouldGetUnreadNotificationCountsSuccessfully() {
        // Arrange
        when(notificationPersonalService.getUnreadCount(USERNAME)).thenReturn(4L);
        when(notificationGroupService.getUnreadGroupCountForUser(USERNAME, List.of("ROLE_STUDENT")))
                .thenReturn(6L);

        // Act
        UnreadCountResponse response = notificationService.getUnreadNotificationCounts(USERNAME,
                List.of("ROLE_STUDENT"));

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getPersonalUnreadCount()).isEqualTo(4L);
        assertThat(response.getGroupUnreadCount()).isEqualTo(6L);
        assertThat(response.getTotalUnreadCount()).isEqualTo(10L);
    }

    // ==================== markNotificationAsRead ====================\

    @Test
    @DisplayName("markNotificationAsRead - should mark group notification as read and invalidate cache")
    void shouldMarkGroupNotificationAsReadAndInvalidateCache() {
        // Act
        notificationService.markNotificationAsRead(NOTIF_ID, NotificationCategory.GROUP, USERNAME);

        // Assert
        verify(notificationGroupService).markGroupNotificationAsRead(NOTIF_ID, USERNAME);
        verify(notificationPersonalService, never()).markAsRead(any(), any());
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(
                RedisPrefixConstant.NOTIFICATION_PREFIX + NotificationCategory.GROUP + ":" + NOTIF_ID));
    }

    @Test
    @DisplayName("markNotificationAsRead - should mark personal notification as read and invalidate cache")
    void shouldMarkPersonalNotificationAsReadAndInvalidateCache() {
        // Act
        notificationService.markNotificationAsRead(NOTIF_ID, NotificationCategory.PERSONAL, USERNAME);

        // Assert
        verify(notificationPersonalService).markAsRead(NOTIF_ID, USERNAME);
        verify(notificationGroupService, never()).markGroupNotificationAsRead(any(), any());
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(
                RedisPrefixConstant.NOTIFICATION_PREFIX + NotificationCategory.PERSONAL + ":"
                        + NOTIF_ID));
    }

    // ==================== markAllNotificationsAsRead ====================\

    @Test
    @DisplayName("markAllNotificationsAsRead - should only mark personal notifications when user roles is empty")
    void shouldOnlyMarkPersonalNotificationsWhenUserRolesIsEmpty() {
        // Act
        notificationService.markAllNotificationsAsRead(USERNAME, Collections.emptyList());

        // Assert
        verify(notificationPersonalService).markAllAsRead(USERNAME);
        verify(userService, never()).findByUsername(any());
        verify(notificationGroupService, never()).markAllAsReadBefore(any(), any(), any());
    }

    @Test
    @DisplayName("markAllNotificationsAsRead - should mark all personal and group notifications when user roles is present")
    void shouldMarkAllPersonalAndGroupNotificationsWhenUserRolesIsPresent() {
        // Arrange
        LocalDateTime createdAt = LocalDateTime.now().minusDays(10);
        UserEntity user = UserEntity.builder()
                .username(USERNAME)
                .createdAt(createdAt)
                .build();

        when(userService.findByUsername(USERNAME)).thenReturn(user);

        // Act
        notificationService.markAllNotificationsAsRead(USERNAME, List.of("ROLE_STUDENT"));

        // Assert
        verify(notificationPersonalService).markAllAsRead(USERNAME);
        verify(userService).findByUsername(USERNAME);
        verify(notificationGroupService).markAllAsReadBefore(USERNAME, List.of("ROLE_STUDENT"), createdAt);
    }

    // ==================== getCachedNotification ====================\

    @Test
    @DisplayName("getCachedNotification - should throw BadRequestException when category is null")
    void shouldThrowBadRequestWhenCategoryIsNullForCachedNotification() {
        // Act & Assert
        assertThatThrownBy(() -> notificationService.getCachedNotification(NOTIF_ID, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Category is null");
    }

    @Test
    @DisplayName("getCachedNotification - should throw DataNotFoundException when group notification not found in DB")
    void shouldThrowDataNotFoundWhenGroupNotificationNotFoundInDb() {
        // Arrange
        when(notificationGroupRepository.findById(NOTIF_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(
                () -> notificationService.getCachedNotification(NOTIF_ID, NotificationCategory.GROUP))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Group notification not found with id: " + NOTIF_ID);
    }

    @Test
    @DisplayName("getCachedNotification - should return cached group notification from DB")
    void shouldReturnCachedGroupNotificationFromDb() {
        // Arrange
        NotificationGroupEntity entity = NotificationGroupEntity.builder()
                .id(NOTIF_ID)
                .title("Group Title")
                .content("Group Content")
                .createdBy("admin")
                .createdAt(LocalDateTime.now())
                .build();

        NotificationGroupTargetEntity targetEntity = NotificationGroupTargetEntity.builder()
                .notificationGroupId(NOTIF_ID)
                .role(RoleEnum.STUDENT)
                .build();

        when(notificationGroupRepository.findById(NOTIF_ID)).thenReturn(Optional.of(entity));
        when(notificationGroupTargetRepository.findByNotificationGroupIdIn(List.of(NOTIF_ID)))
                .thenReturn(List.of(targetEntity));

        // Act
        CachedNotification cached = notificationService.getCachedNotification(NOTIF_ID,
                NotificationCategory.GROUP);

        // Assert
        assertThat(cached).isNotNull();
        assertThat(cached.getId()).isEqualTo(NOTIF_ID);
        assertThat(cached.getCategory()).isEqualTo(NotificationCategory.GROUP);
        assertThat(cached.getTargetRoles()).containsExactly(RoleEnum.STUDENT);
    }

    @Test
    @DisplayName("getCachedNotification - should throw DataNotFoundException when personal notification not found in DB")
    void shouldThrowDataNotFoundWhenPersonalNotificationNotFoundInDb() {
        // Arrange
        when(notificationRepository.findById(NOTIF_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> notificationService.getCachedNotification(NOTIF_ID,
                NotificationCategory.PERSONAL))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Personal notification not found with id: " + NOTIF_ID);
    }

    @Test
    @DisplayName("getCachedNotification - should return cached personal notification from DB")
    void shouldReturnCachedPersonalNotificationFromDb() {
        // Arrange
        NotificationPersonalEntity entity = NotificationPersonalEntity.builder()
                .id(NOTIF_ID)
                .username(USERNAME)
                .title("Personal Title")
                .content("Personal Content")
                .createdAt(LocalDateTime.now())
                .build();

        when(notificationRepository.findById(NOTIF_ID)).thenReturn(Optional.of(entity));

        // Act
        CachedNotification cached = notificationService.getCachedNotification(NOTIF_ID,
                NotificationCategory.PERSONAL);

        // Assert
        assertThat(cached).isNotNull();
        assertThat(cached.getId()).isEqualTo(NOTIF_ID);
        assertThat(cached.getUsername()).isEqualTo(USERNAME);
        assertThat(cached.getCategory()).isEqualTo(NotificationCategory.PERSONAL);
    }

    // ==================== deleteNotification ====================\

    @Test
    @DisplayName("deleteNotification - should throw DataNotFoundException when deleting non-existent notification")
    void shouldThrowDataNotFoundWhenDeletingNonExistentNotification() {
        // Arrange
        when(notificationRepository.findById(NOTIF_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> notificationService.deleteNotification(NOTIF_ID, USERNAME))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Notification not found");
    }

    @Test
    @DisplayName("deleteNotification - should throw BadRequestException when user is not notification owner")
    void shouldThrowBadRequestWhenUserIsNotNotificationOwner() {
        // Arrange
        NotificationPersonalEntity entity = NotificationPersonalEntity.builder()
                .id(NOTIF_ID)
                .username("otheruser")
                .build();

        when(notificationRepository.findById(NOTIF_ID)).thenReturn(Optional.of(entity));

        // Act & Assert
        assertThatThrownBy(() -> notificationService.deleteNotification(NOTIF_ID, USERNAME))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("You do not have permission to delete this notification");

        verify(notificationRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteNotification - should delete notification successfully")
    void shouldDeleteNotificationSuccessfully() {
        // Arrange
        NotificationPersonalEntity entity = NotificationPersonalEntity.builder()
                .id(NOTIF_ID)
                .username(USERNAME)
                .build();

        when(notificationRepository.findById(NOTIF_ID)).thenReturn(Optional.of(entity));

        // Act
        notificationService.deleteNotification(NOTIF_ID, USERNAME);

        // Assert
        verify(notificationRepository).delete(entity);
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(
                RedisPrefixConstant.NOTIFICATION_PREFIX + NotificationCategory.PERSONAL + ":"
                        + NOTIF_ID));
    }
}
