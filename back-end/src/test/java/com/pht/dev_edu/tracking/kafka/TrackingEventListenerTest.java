package com.pht.dev_edu.tracking.kafka;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.support.Acknowledgment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.assignment.dto.SubmissionEvent;
import com.pht.dev_edu.common.service.MailService;
import com.pht.dev_edu.forum.document.PostDocument;
import com.pht.dev_edu.forum.dto.PostInteractiveData;
import com.pht.dev_edu.forum.service.PostElasticService;
import com.pht.dev_edu.tracking.dto.CronJobEvent;
import com.pht.dev_edu.tracking.dto.RequestLoggingEvent;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import com.pht.dev_edu.tracking.service.LogService;
import com.pht.dev_edu.tracking.service.SubmissionService;
import com.pht.dev_edu.user.dto.MailPayload;

@ExtendWith(MockitoExtension.class)
class TrackingEventListenerTest {

    @Mock
    private LogService logService;

    @Mock
    private SubmissionService submissionService;

    @Mock
    private MailService mailService;

    @Mock
    private PostElasticService postElasticService;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private Acknowledgment ack;

    @InjectMocks
    private TrackingEventListener trackingEventListener;

    @Test
    @DisplayName("handleTrackingEvent - should parse payload, save tracking log and acknowledge")
    void shouldHandleTrackingEvent() throws JsonProcessingException {
        // Arrange
        String payload = "{\"username\":\"user1\"}";
        TrackingEvent event = TrackingEvent.builder().username("user1").build();
        when(objectMapper.readValue(payload, TrackingEvent.class)).thenReturn(event);

        // Act
        trackingEventListener.handleTrackingEvent(payload, ack);

        // Assert
        verify(logService).saveTrackingLog(event);
        verify(ack).acknowledge();
    }

    @Test
    @DisplayName("handleSubmissionEvent - should parse payload, save submission log and acknowledge")
    void shouldHandleSubmissionEvent() throws JsonProcessingException {
        // Arrange
        String payload = "{\"username\":\"student1\"}";
        SubmissionEvent event = SubmissionEvent.builder().username("student1").build();
        when(objectMapper.readValue(payload, SubmissionEvent.class)).thenReturn(event);

        // Act
        trackingEventListener.handleSubmissionEvent(payload, ack);

        // Assert
        verify(submissionService).saveSubmissionLog(event);
        verify(ack).acknowledge();
    }

    @Test
    @DisplayName("handleCronJobEvent - should parse payload, save cron job log and acknowledge")
    void shouldHandleCronJobEvent() throws JsonProcessingException {
        // Arrange
        String payload = "{\"cronJobName\":\"job1\"}";
        CronJobEvent event = CronJobEvent.builder().cronJobName("job1").build();
        when(objectMapper.readValue(payload, CronJobEvent.class)).thenReturn(event);

        // Act
        trackingEventListener.handleCronJobEvent(payload, ack);

        // Assert
        verify(logService).saveCronJobLog(event);
        verify(ack).acknowledge();
    }

    @Test
    @DisplayName("handleLogRequestEvent - should parse payload, save request log and acknowledge")
    void shouldHandleLogRequestEvent() throws JsonProcessingException {
        // Arrange
        String payload = "{\"method\":\"POST\"}";
        RequestLoggingEvent event = RequestLoggingEvent.builder().method("POST").build();
        when(objectMapper.readValue(payload, RequestLoggingEvent.class)).thenReturn(event);

        // Act
        trackingEventListener.handleLogRequestEvent(payload, ack);

        // Assert
        verify(logService).saveRequestLog(event);
        verify(ack).acknowledge();
    }

    @Test
    @DisplayName("handleSendMailEvent - should parse payload, send mail and acknowledge")
    void shouldHandleSendMailEvent() throws JsonProcessingException {
        // Arrange
        String payload = "{\"toMail\":\"test@example.com\"}";
        MailPayload mailPayload = MailPayload.builder()
                .toMail("test@example.com")
                .subject(MailPayload.Subject.WELCOME)
                .template(MailPayload.Template.WELCOME_TEMPLATE)
                .mailAttributes(Map.of())
                .fileAttributes(Map.of())
                .build();
        when(objectMapper.readValue(payload, MailPayload.class)).thenReturn(mailPayload);

        // Act
        trackingEventListener.handleSendMailEvent(payload, ack);

        // Assert
        verify(mailService).sendMail(any(com.pht.dev_edu.common.dto.MailPayload.class));
        verify(ack).acknowledge();
    }

    @Test
    @DisplayName("syncPostUpdateEvent - should parse payload, upsert post content in Elasticsearch and acknowledge")
    void shouldSyncPostUpdateEvent() throws JsonProcessingException {
        // Arrange
        String payload = "{\"title\":\"Post Title\"}";
        PostDocument document = new PostDocument();
        when(objectMapper.readValue(payload, PostDocument.class)).thenReturn(document);

        // Act
        trackingEventListener.syncPostUpdateEvent(payload, ack);

        // Assert
        verify(postElasticService).upsertPostContent(document);
        verify(ack).acknowledge();
    }

    @Test
    @DisplayName("syncPostInteractiveUpdateEvent - should parse payload, update interactive data in Elasticsearch and acknowledge")
    void shouldSyncPostInteractiveUpdateEvent() throws JsonProcessingException {
        // Arrange
        String payload = "{\"viewCount\":10}";
        PostInteractiveData data = new PostInteractiveData();
        when(objectMapper.readValue(payload, PostInteractiveData.class)).thenReturn(data);

        // Act
        trackingEventListener.syncPostInteractiveUpdateEvent(payload, ack);

        // Assert
        verify(postElasticService).updateInteractiveData(data);
        verify(ack).acknowledge();
    }

    @Test
    @DisplayName("syncPostDeleteEvent - should parse payload, delete post from Elasticsearch and acknowledge")
    void shouldSyncPostDeleteEvent() throws JsonProcessingException {
        // Arrange
        String payload = "\"123e4567-e89b-12d3-a456-426614174000\"";
        UUID postId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        when(objectMapper.readValue(payload, UUID.class)).thenReturn(postId);

        // Act
        trackingEventListener.syncPostDeleteEvent(payload, ack);

        // Assert
        verify(postElasticService).deletePost(postId);
        verify(ack).acknowledge();
    }
}
