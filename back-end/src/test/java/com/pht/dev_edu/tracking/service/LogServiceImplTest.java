package com.pht.dev_edu.tracking.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pht.dev_edu.tracking.dto.CronJobEvent;
import com.pht.dev_edu.tracking.dto.RequestLoggingEvent;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import com.pht.dev_edu.tracking.entity.LogCronJobEntity;
import com.pht.dev_edu.tracking.entity.LogRequestEntity;
import com.pht.dev_edu.tracking.entity.LogTrackingEntity;
import com.pht.dev_edu.tracking.repo.LogCronJobRepository;
import com.pht.dev_edu.tracking.repo.LogRepository;
import com.pht.dev_edu.tracking.repo.LogRequestRepository;

@ExtendWith(MockitoExtension.class)
class LogServiceImplTest {

    @Mock
    private LogRepository logRepository;

    @Mock
    private LogCronJobRepository logCronJobRepository;

    @Mock
    private LogRequestRepository logRequestRepository;

    @InjectMocks
    private LogServiceImpl logService;

    @Test
    @DisplayName("saveTrackingLog - should map tracking event and save entity")
    void shouldSaveTrackingLog() {
        // Arrange
        UUID aggId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        TrackingEvent event = TrackingEvent.builder()
                .username("user1")
                .aggregateId(aggId)
                .action("CREATE_POST")
                .details("Created a post")
                .timestamp(now)
                .build();

        // Act
        logService.saveTrackingLog(event);

        // Assert
        ArgumentCaptor<LogTrackingEntity> captor = ArgumentCaptor.forClass(LogTrackingEntity.class);
        verify(logRepository).save(captor.capture());

        LogTrackingEntity savedEntity = captor.getValue();
        assertThat(savedEntity.getUsername()).isEqualTo("user1");
        assertThat(savedEntity.getAggregateId()).isEqualTo(aggId);
        assertThat(savedEntity.getAction()).isEqualTo("CREATE_POST");
        assertThat(savedEntity.getDetails()).isEqualTo("Created a post");
        assertThat(savedEntity.getCreatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("saveCronJobLog - should map cron job event and save entity")
    void shouldSaveCronJobLog() {
        // Arrange
        LocalDateTime start = LocalDateTime.now().minusMinutes(5);
        LocalDateTime finish = LocalDateTime.now();
        CronJobEvent event = CronJobEvent.builder()
                .cronJobName("CLEANUP_JOB")
                .status(CronJobEvent.Status.SUCCESS)
                .details("Cleaned 100 records")
                .startTime(start)
                .finishedTime(finish)
                .errorMessage(null)
                .errorStackTrace(null)
                .build();

        // Act
        logService.saveCronJobLog(event);

        // Assert
        ArgumentCaptor<LogCronJobEntity> captor = ArgumentCaptor.forClass(LogCronJobEntity.class);
        verify(logCronJobRepository).save(captor.capture());

        LogCronJobEntity savedEntity = captor.getValue();
        assertThat(savedEntity.getName()).isEqualTo("CLEANUP_JOB");
        assertThat(savedEntity.getStatus()).isEqualTo(CronJobEvent.Status.SUCCESS);
        assertThat(savedEntity.getDetail()).isEqualTo("Cleaned 100 records");
        assertThat(savedEntity.getCreatedAt()).isEqualTo(start);
        assertThat(savedEntity.getFinishedAt()).isEqualTo(finish);
        assertThat(savedEntity.getErrorMessage()).isNull();
    }

    @Test
    @DisplayName("saveRequestLog - should map request logging event and save entity")
    void shouldSaveRequestLog() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        RequestLoggingEvent event = RequestLoggingEvent.builder()
                .username("john_doe")
                .method("POST")
                .uri("/api/v1/posts")
                .requestBody("{\"title\": \"Hello\"}")
                .responseBody("{\"id\": 1}")
                .timestamp(now)
                .build();

        // Act
        logService.saveRequestLog(event);

        // Assert
        ArgumentCaptor<LogRequestEntity> captor = ArgumentCaptor.forClass(LogRequestEntity.class);
        verify(logRequestRepository).save(captor.capture());

        LogRequestEntity savedEntity = captor.getValue();
        assertThat(savedEntity.getUsername()).isEqualTo("john_doe");
        assertThat(savedEntity.getMethod()).isEqualTo("POST");
        assertThat(savedEntity.getUri()).isEqualTo("/api/v1/posts");
        assertThat(savedEntity.getRequestBody()).isEqualTo("{\"title\": \"Hello\"}");
        assertThat(savedEntity.getResponseBody()).isEqualTo("{\"id\": 1}");
        assertThat(savedEntity.getTimestamp()).isEqualTo(now);
    }
}
