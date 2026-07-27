package com.pht.dev_edu.tracking.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.pht.dev_edu.assignment.dto.SubmissionEvent;
import com.pht.dev_edu.assignment.dto.SubmissionLogResponse;
import com.pht.dev_edu.assignment.service.AssignmentPermissionService;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.tracking.entity.SubmissionTrackingEntity;
import com.pht.dev_edu.tracking.mapper.SubmissionTrackingMapper;
import com.pht.dev_edu.tracking.repo.SubmissionRepository;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceImplTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private AssignmentPermissionService assignmentPermissionService;

    @Mock
    private SubmissionTrackingMapper submissionMapper;

    @Mock
    private Executor executor;

    @InjectMocks
    private SubmissionServiceImpl submissionService;

    private MockedStatic<TransactionUtils> transactionUtilsMock;
    private MockedStatic<KafkaUtils> kafkaUtilsMock;

    @BeforeEach
    void setUp() {
        transactionUtilsMock = mockStatic(TransactionUtils.class);
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
    }

    @AfterEach
    void tearDown() {
        transactionUtilsMock.close();
        kafkaUtilsMock.close();
    }

    @Test
    @DisplayName("getSubmissionLogsByAssignmentIdForStudent - should check permission, query repository and map response")
    void shouldGetSubmissionLogsByAssignmentIdForStudent() {
        // Arrange
        Set<String> authorities = Set.of("ROLE_TEACHER");
        String actor = "teacher1";
        String studentUsername = "student1";
        UUID assignmentId = UUID.randomUUID();
        int page = 0;

        SubmissionTrackingEntity entity = SubmissionTrackingEntity.builder()
                .assignmentId(assignmentId)
                .actor(studentUsername)
                .build();
        PageImpl<SubmissionTrackingEntity> entityPage = new PageImpl<>(List.of(entity));

        when(submissionRepository.findByAssignmentIdAndActor(eq(assignmentId), eq(studentUsername),
                any(Pageable.class)))
                .thenReturn(entityPage);

        SubmissionLogResponse response = SubmissionLogResponse.builder().build();
        when(submissionMapper.entityToResponse(entity)).thenReturn(response);

        // Act
        CustomPaging<SubmissionLogResponse> result = submissionService.getSubmissionLogsByAssignmentIdForStudent(
                authorities, actor, studentUsername, assignmentId, page);

        // Assert
        verify(assignmentPermissionService).checkViewAssignmentPermissionByAssignment(authorities, actor, assignmentId);
        assertThat(result).isNotNull();
        assertThat(result.getContents()).containsExactly(response);
    }

    @Test
    @DisplayName("saveSubmissionLog - SUBMITTED action should save submission entity with submitted details")
    void shouldSaveSubmissionLogSubmitted() {
        // Arrange
        UUID assignmentId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        SubmissionEvent event = SubmissionEvent.builder()
                .assignmentId(assignmentId)
                .username("student1")
                .fullObjectKey("assignments/key.pdf")
                .action(SubmissionEvent.Action.SUBMITTED)
                .timestamp(now)
                .build();

        // Act
        submissionService.saveSubmissionLog(event);

        // Assert
        ArgumentCaptor<SubmissionTrackingEntity> captor = ArgumentCaptor.forClass(SubmissionTrackingEntity.class);
        verify(submissionRepository).save(captor.capture());

        SubmissionTrackingEntity saved = captor.getValue();
        assertThat(saved.getAssignmentId()).isEqualTo(assignmentId);
        assertThat(saved.getActor()).isEqualTo("student1");
        assertThat(saved.getStatus()).isEqualTo(SubmissionEvent.Action.SUBMITTED);
        assertThat(saved.getDetails()).isEqualTo("Submitted object key: assignments/key.pdf");
        assertThat(saved.getUpdatedAt()).isEqualTo(now);

        transactionUtilsMock.verifyNoInteractions();
    }

    @Test
    @DisplayName("saveSubmissionLog - UNSUBMITTED action should save entity and send delete file event after commit")
    void shouldSaveSubmissionLogUnsubmitted() {
        // Arrange
        UUID assignmentId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        SubmissionEvent event = SubmissionEvent.builder()
                .assignmentId(assignmentId)
                .username("student1")
                .fullObjectKey("assignments/key.pdf")
                .action(SubmissionEvent.Action.UNSUBMITTED)
                .timestamp(now)
                .build();

        transactionUtilsMock.when(() -> TransactionUtils.runAfterCommitAsync(any(Runnable.class), eq(executor)))
                .thenAnswer(invocation -> {
                    Runnable runnable = invocation.getArgument(0);
                    runnable.run();
                    return null;
                });

        // Act
        submissionService.saveSubmissionLog(event);

        // Assert
        ArgumentCaptor<SubmissionTrackingEntity> captor = ArgumentCaptor.forClass(SubmissionTrackingEntity.class);
        verify(submissionRepository).save(captor.capture());

        SubmissionTrackingEntity saved = captor.getValue();
        assertThat(saved.getAssignmentId()).isEqualTo(assignmentId);
        assertThat(saved.getActor()).isEqualTo("student1");
        assertThat(saved.getStatus()).isEqualTo(SubmissionEvent.Action.UNSUBMITTED);
        assertThat(saved.getDetails()).isEqualTo("Unsubmitted");

        kafkaUtilsMock.verify(() -> KafkaUtils.sendDeleteFileEvent("assignments/key.pdf"));
    }
}
