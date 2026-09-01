package com.pht.dev_edu.file.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.time.Duration;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.file.dto.MultipartUploadSession;
import com.pht.dev_edu.file.dto.UploadStatus;

@ExtendWith(MockitoExtension.class)
class RedisFileMultipartSessionStoreTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private RedisFileMultipartSessionStore sessionStore;

    private static final String SESSION_ID = "test-session-id";
    private static final String KEY = RedisPrefixConstant.FILE_MULTIPART_SESSION_PREFIX + SESSION_ID;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("save - should store session in Redis with TTL")
    void shouldSaveSessionInRedis() {
        MultipartUploadSession session = MultipartUploadSession.builder()
                .sessionId(SESSION_ID)
                .uploadId("upload-123")
                .status(UploadStatus.PENDING)
                .build();

        Duration ttl = Duration.ofHours(24);

        sessionStore.save(session, ttl);

        verify(valueOperations).set(KEY, session, ttl);
    }

    @Test
    @DisplayName("findById - should retrieve and convert session when key exists")
    void shouldFindSessionById() {
        Object rawCached = new Object();
        MultipartUploadSession expectedSession = MultipartUploadSession.builder()
                .sessionId(SESSION_ID)
                .uploadId("upload-123")
                .status(UploadStatus.PENDING)
                .build();

        when(valueOperations.get(KEY)).thenReturn(rawCached);
        when(objectMapper.convertValue(rawCached, MultipartUploadSession.class)).thenReturn(expectedSession);

        Optional<MultipartUploadSession> result = sessionStore.findById(SESSION_ID);

        assertThat(result).isPresent().contains(expectedSession);
        verify(valueOperations).get(KEY);
    }

    @Test
    @DisplayName("findById - should return empty when key not found")
    void shouldReturnEmptyWhenNotFound() {
        when(valueOperations.get(KEY)).thenReturn(null);

        Optional<MultipartUploadSession> result = sessionStore.findById(SESSION_ID);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("delete - should remove key from Redis")
    void shouldDeleteSession() {
        sessionStore.delete(SESSION_ID);

        verify(redisTemplate).delete(KEY);
    }
}
