package com.pht.dev_edu.notification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
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

import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.notification.dto.CreateGroupNotificationRequest;
import com.pht.dev_edu.notification.dto.NotificationCategory;
import com.pht.dev_edu.notification.dto.NotificationResponse;
import com.pht.dev_edu.notification.entity.NotificationGroupEntity;
import com.pht.dev_edu.notification.entity.NotificationGroupTargetEntity;
import com.pht.dev_edu.notification.repo.NotificationGroupReadStatusRepository;
import com.pht.dev_edu.notification.repo.NotificationGroupRepository;
import com.pht.dev_edu.notification.repo.NotificationGroupTargetRepository;
import com.pht.dev_edu.tracking.dto.TrackingEvent;

/*
 * <analysis>
 * NotificationGroupServiceImpl
 * - createGroupNotification(CreateGroupNotificationRequest request, String createdBy)
 *   - branches:
 *       if request.targetRoles is empty/null -> BadRequestException
 *       else -> save group entity, save target entities, return NotificationResponse
 *   - paths:
 *       [P1: targetRoles empty -> BadRequestException]
 *       [P2: valid request -> NotificationResponse returned and entities saved]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenTargetRolesIsEmpty -> P1]
 *       [shouldCreateGroupNotificationSuccessfully -> P2]
 *
 * - getAllGroupNotifications(String cursor)
 *   - branches:
 *       cursor is null/blank -> use default cursor
 *       cursor is valid -> decode cursor
 *       repository returns empty list -> return empty CustomPaging
 *       repository returns group entities -> resolve target roles map, return CustomPaging
 *   - paths:
 *       [P1: empty result from repository -> empty CustomPaging]
 *       [P2: group entities present -> return populated CustomPaging with target roles]
 *   - planned tests:
 *       [shouldReturnEmptyPagingWhenNoGroupNotificationsFound -> P1]
 *       [shouldReturnPagedGroupNotificationsSuccessfully -> P2]
 *
 * - getUnreadGroupCountForUser(String username, Collection<String> userRoles)
 *   - branches:
 *       SecurityContextUtils.extractRoleEnums(userRoles) is empty -> return 0
 *       else -> return count from read status repository
 *   - paths:
 *       [P1: empty user roles -> return 0]
 *       [P2: valid user roles -> return unread count]
 *   - planned tests:
 *       [shouldReturnZeroWhenUserRolesIsEmpty -> P1]
 *       [shouldReturnUnreadGroupCountForUser -> P2]
 *
 * - markGroupNotificationAsRead(UUID groupId, String username)
 *   - branches:
 *       notificationGroupRepository.findByIdAndDeletedAtIsNull(groupId) returns empty -> DataNotFoundException
 *       else -> upsert read status
 *   - paths:
 *       [P1: group notification not found -> DataNotFoundException]
 *       [P2: group notification exists -> upsert read status]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenGroupNotificationDoesNotExist -> P1]
 *       [shouldMarkGroupNotificationAsReadSuccessfully -> P2]
 *
 * - markAllAsReadBefore(String username, Collection<String> userRoles, LocalDateTime timestamp)
 *   - branches:
 *       userRoles extract to empty roles -> return early
 *       unreadGroupIds is empty -> return early
 *       else -> batch upsert read status
 *   - paths:
 *       [P1: empty user roles -> return early]
 *       [P2: no unread group ids -> return early]
 *       [P3: unread group ids present -> execute batch upsert]
 *   - planned tests:
 *       [shouldReturnEarlyWhenUserRolesIsEmptyForMarkAll -> P1]
 *       [shouldReturnEarlyWhenNoUnreadGroupIdsFound -> P2]
 *       [shouldMarkAllGroupNotificationsAsReadBeforeTimestamp -> P3]
 *
 * - softDeleteGroupNotification(UUID groupId, String username)
 *   - branches:
 *       softDeleteById returns 0 -> DataNotFoundException
 *       softDeleteById returns > 0 -> invalidate cache & send tracking event async
 *   - paths:
 *       [P1: soft delete updated 0 rows -> DataNotFoundException]
 *       [P2: soft delete updated > 0 rows -> invalidate cache and send tracking event]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenSoftDeletingNonExistentGroupNotification -> P1]
 *       [shouldSoftDeleteGroupNotificationSuccessfully -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for NotificationGroupServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify group notification management logic in NotificationGroupServiceImpl.
 *
 * Test Scope
 * ----------
 * - createGroupNotification()
 * - getAllGroupNotifications()
 * - getUnreadGroupCountForUser()
 * - markGroupNotificationAsRead()
 * - markAllAsReadBefore()
 * - softDeleteGroupNotification()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Group notification creation & target role persistence
 * ✓ Target roles validation (empty/null checks)
 * ✓ Paged fetching of group notifications with cursor decoding
 * ✓ Unread notification counting by extracted role enums
 * ✓ Marking single and batch notifications as read
 * ✓ Soft-deletion with cache invalidation and Kafka tracking event emission
 *
 * Mocked Dependencies
 * -------------------
 * - NotificationGroupRepository
 * - NotificationGroupTargetRepository
 * - NotificationGroupReadStatusRepository
 * - Executor
 * - RedisUtils (static)
 * - KafkaUtils (static)
 * - TransactionUtils (static)
 */
@ExtendWith(MockitoExtension.class)
class NotificationGroupServiceImplTest {

    @Mock
    private NotificationGroupRepository notificationGroupRepository;
    @Mock
    private NotificationGroupTargetRepository notificationGroupTargetRepository;
    @Mock
    private NotificationGroupReadStatusRepository notificationGroupReadStatusRepository;
    @Mock
    private Executor executor;

    @InjectMocks
    private NotificationGroupServiceImpl notificationGroupService;

    private MockedStatic<RedisUtils> redisUtilsMock;
    private MockedStatic<KafkaUtils> kafkaUtilsMock;
    private MockedStatic<TransactionUtils> transactionUtilsMock;

    private static final String USERNAME = "testuser";
    private static final UUID GROUP_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        redisUtilsMock = mockStatic(RedisUtils.class);
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
        transactionUtilsMock = mockStatic(TransactionUtils.class);
    }

    @AfterEach
    void tearDown() {
        redisUtilsMock.close();
        kafkaUtilsMock.close();
        transactionUtilsMock.close();
    }

    // ==================== createGroupNotification ====================

    @Test
    @DisplayName("createGroupNotification - should throw BadRequestException when target roles is empty")
    void shouldThrowBadRequestWhenTargetRolesIsEmpty() {
        // Arrange
        CreateGroupNotificationRequest request = CreateGroupNotificationRequest.builder()
                .title("Test Title")
                .content("Test Content")
                .targetRoles(Collections.emptySet())
                .build();

        // Act & Assert
        assertThatThrownBy(() -> notificationGroupService.createGroupNotification(request, USERNAME))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Target roles cannot be empty for group notification");

        verify(notificationGroupRepository, never()).save(any());
    }

    @Test
    @DisplayName("createGroupNotification - should create group notification successfully")
    void shouldCreateGroupNotificationSuccessfully() {
        // Arrange
        CreateGroupNotificationRequest request = CreateGroupNotificationRequest.builder()
                .title("Announcement")
                .content("System Maintenance")
                .targetRoles(Set.of(RoleEnum.STUDENT, RoleEnum.LECTURER))
                .build();

        NotificationGroupEntity savedEntity = NotificationGroupEntity.builder()
                .id(GROUP_ID)
                .title("Announcement")
                .content("System Maintenance")
                .createdBy(USERNAME)
                .createdAt(LocalDateTime.now())
                .build();

        when(notificationGroupRepository.save(any(NotificationGroupEntity.class))).thenReturn(savedEntity);

        // Act
        NotificationResponse response = notificationGroupService.createGroupNotification(request, USERNAME);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(GROUP_ID);
        assertThat(response.getTitle()).isEqualTo("Announcement");
        assertThat(response.getContent()).isEqualTo("System Maintenance");
        assertThat(response.getCategory()).isEqualTo(NotificationCategory.GROUP);
        assertThat(response.getTargetRoles()).containsExactlyInAnyOrder(RoleEnum.STUDENT, RoleEnum.LECTURER);
        assertThat(response.getIsRead()).isFalse();

        verify(notificationGroupRepository).save(any(NotificationGroupEntity.class));
        verify(notificationGroupTargetRepository).saveAll(any());
    }

    // ==================== getAllGroupNotifications ====================

    @Test
    @DisplayName("getAllGroupNotifications - should return empty paging when no group notifications found")
    void shouldReturnEmptyPagingWhenNoGroupNotificationsFound() {
        // Arrange
        when(notificationGroupRepository.findActiveWithCursor(any(), any(), eq(11)))
                .thenReturn(Collections.emptyList());

        // Act
        CustomPaging<NotificationResponse> result = notificationGroupService.getAllGroupNotifications(null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContents()).isNullOrEmpty();
    }

    @Test
    @DisplayName("getAllGroupNotifications - should return paged group notifications successfully")
    void shouldReturnPagedGroupNotificationsSuccessfully() {
        // Arrange
        NotificationGroupEntity entity = NotificationGroupEntity.builder()
                .id(GROUP_ID)
                .title("General News")
                .content("Welcome back")
                .createdBy("admin")
                .createdAt(LocalDateTime.now())
                .build();

        NotificationGroupTargetEntity targetEntity = NotificationGroupTargetEntity.builder()
                .notificationGroupId(GROUP_ID)
                .role(RoleEnum.STUDENT)
                .build();

        when(notificationGroupRepository.findActiveWithCursor(any(), any(), eq(11)))
                .thenReturn(List.of(entity));
        when(notificationGroupTargetRepository.findByNotificationGroupIdIn(List.of(GROUP_ID)))
                .thenReturn(List.of(targetEntity));

        // Act
        CustomPaging<NotificationResponse> result = notificationGroupService.getAllGroupNotifications(null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContents()).hasSize(1);
        NotificationResponse firstItem = result.getContents().iterator().next();
        assertThat(firstItem.getId()).isEqualTo(GROUP_ID);
        assertThat(firstItem.getTargetRoles()).containsExactly(RoleEnum.STUDENT);
    }

    // ==================== getUnreadGroupCountForUser ====================

    @Test
    @DisplayName("getUnreadGroupCountForUser - should return zero when user roles is empty")
    void shouldReturnZeroWhenUserRolesIsEmpty() {
        // Act
        long count = notificationGroupService.getUnreadGroupCountForUser(USERNAME, Collections.emptyList());

        // Assert
        assertThat(count).isEqualTo(0);
        verify(notificationGroupReadStatusRepository, never())
                .countUnreadGroupNotificationsByRolesAndUsername(any(), anyString());
    }

    @Test
    @DisplayName("getUnreadGroupCountForUser - should return unread group count for user")
    void shouldReturnUnreadGroupCountForUser() {
        // Arrange
        when(notificationGroupReadStatusRepository.countUnreadGroupNotificationsByRolesAndUsername(
                Set.of(RoleEnum.STUDENT), USERNAME)).thenReturn(5L);

        // Act
        long count = notificationGroupService.getUnreadGroupCountForUser(USERNAME, List.of("ROLE_STUDENT"));

        // Assert
        assertThat(count).isEqualTo(5L);
    }

    // ==================== markGroupNotificationAsRead ====================

    @Test
    @DisplayName("markGroupNotificationAsRead - should throw DataNotFoundException when group notification does not exist")
    void shouldThrowDataNotFoundWhenGroupNotificationDoesNotExist() {
        // Arrange
        when(notificationGroupRepository.findByIdAndDeletedAtIsNull(GROUP_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> notificationGroupService.markGroupNotificationAsRead(GROUP_ID, USERNAME))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Group notification not found with id: " + GROUP_ID);
    }

    @Test
    @DisplayName("markGroupNotificationAsRead - should mark group notification as read successfully")
    void shouldMarkGroupNotificationAsReadSuccessfully() {
        // Arrange
        NotificationGroupEntity entity = NotificationGroupEntity.builder()
                .id(GROUP_ID)
                .title("Notice")
                .build();
        when(notificationGroupRepository.findByIdAndDeletedAtIsNull(GROUP_ID)).thenReturn(Optional.of(entity));

        // Act
        notificationGroupService.markGroupNotificationAsRead(GROUP_ID, USERNAME);

        // Assert
        verify(notificationGroupReadStatusRepository).upsertReadStatus(
                any(), eq(GROUP_ID), eq(USERNAME), any(LocalDateTime.class));
    }

    // ==================== markAllAsReadBefore ====================

    @Test
    @DisplayName("markAllAsReadBefore - should return early when user roles is empty")
    void shouldReturnEarlyWhenUserRolesIsEmptyForMarkAll() {
        // Act
        notificationGroupService.markAllAsReadBefore(USERNAME, Collections.emptyList(), LocalDateTime.now());

        // Assert
        verify(notificationGroupReadStatusRepository, never())
                .findUnreadGroupIdsByRolesAndTimestamp(any(), anyString(), any());
    }

    @Test
    @DisplayName("markAllAsReadBefore - should return early when no unread group ids found")
    void shouldReturnEarlyWhenNoUnreadGroupIdsFound() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        when(notificationGroupReadStatusRepository.findUnreadGroupIdsByRolesAndTimestamp(
                Set.of(RoleEnum.STUDENT), USERNAME, now)).thenReturn(Collections.emptyList());

        // Act
        notificationGroupService.markAllAsReadBefore(USERNAME, List.of("ROLE_STUDENT"), now);

        // Assert
        verify(notificationGroupReadStatusRepository, never())
                .batchUpsertReadStatus(anyString(), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("markAllAsReadBefore - should mark all group notifications as read before timestamp")
    void shouldMarkAllGroupNotificationsAsReadBeforeTimestamp() {
        // Arrange
        LocalDateTime timestamp = LocalDateTime.now();
        UUID unreadId1 = UUID.randomUUID();
        UUID unreadId2 = UUID.randomUUID();

        when(notificationGroupReadStatusRepository.findUnreadGroupIdsByRolesAndTimestamp(
                Set.of(RoleEnum.STUDENT), USERNAME, timestamp))
                .thenReturn(List.of(unreadId1, unreadId2));

        // Act
        notificationGroupService.markAllAsReadBefore(USERNAME, List.of("ROLE_STUDENT"), timestamp);

        // Assert
        verify(notificationGroupReadStatusRepository).batchUpsertReadStatus(
                anyString(), containsString(unreadId1.toString()), eq(USERNAME),
                any(LocalDateTime.class));
    }

    // ==================== softDeleteGroupNotification ====================

    @Test
    @DisplayName("softDeleteGroupNotification - should throw DataNotFoundException when soft deleting non-existent group notification")
    void shouldThrowDataNotFoundWhenSoftDeletingNonExistentGroupNotification() {
        // Arrange
        when(notificationGroupRepository.softDeleteById(eq(GROUP_ID), any(LocalDateTime.class))).thenReturn(0);

        // Act & Assert
        assertThatThrownBy(() -> notificationGroupService.softDeleteGroupNotification(GROUP_ID, USERNAME))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining(
                        "Group notification not found or already deleted with id: " + GROUP_ID);
    }

    @Test
    @DisplayName("softDeleteGroupNotification - should soft delete group notification successfully")
    void shouldSoftDeleteGroupNotificationSuccessfully() {
        // Arrange
        when(notificationGroupRepository.softDeleteById(eq(GROUP_ID), any(LocalDateTime.class))).thenReturn(1);

        transactionUtilsMock.when(
                () -> TransactionUtils.runAfterCommitAsync(any(Runnable.class), any(Executor.class)))
                .thenAnswer(invocation -> {
                    Runnable runnable = invocation.getArgument(0);
                    runnable.run();
                    return null;
                });

        // Act
        notificationGroupService.softDeleteGroupNotification(GROUP_ID, USERNAME);

        // Assert
        verify(notificationGroupRepository).softDeleteById(eq(GROUP_ID), any(LocalDateTime.class));
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(
                RedisPrefixConstant.NOTIFICATION_PREFIX + NotificationCategory.GROUP + ":" + GROUP_ID));
        kafkaUtilsMock.verify(() -> KafkaUtils.sendTrackingEvent(any(TrackingEvent.class)));
    }

    private static String containsString(String expected) {
        return org.mockito.ArgumentMatchers.argThat(arg -> arg != null && arg.contains(expected));
    }
}
