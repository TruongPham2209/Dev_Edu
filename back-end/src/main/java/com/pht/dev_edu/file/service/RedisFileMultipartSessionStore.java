package com.pht.dev_edu.file.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.file.dto.MultipartUploadSession;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

/**
 * Redis-backed implementation of {@link FileMultipartSessionStore}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RedisFileMultipartSessionStore implements FileMultipartSessionStore {
    RedisTemplate<String, Object> redisTemplate;
    ObjectMapper objectMapper;

    @Override
    public void save(MultipartUploadSession session, Duration ttl) {
        if (session == null || session.getSessionId() == null) {
            return;
        }
        String key = buildCacheKey(session.getSessionId());
        Duration safeTtl = (ttl != null && ttl.toMinutes() >= 1) ? ttl : Duration.ofHours(3);
        redisTemplate.opsForValue().set(key, session, safeTtl);
        log.info("Saved multipart upload session in Redis: key={}, ttl={}", key, safeTtl);
    }

    @Override
    public Optional<MultipartUploadSession> findById(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return Optional.empty();
        }
        String key = buildCacheKey(sessionId);
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached == null) {
            log.warn("Multipart upload session not found or expired in Redis: key={}", key);
            return Optional.empty();
        }
        try {
            MultipartUploadSession session = objectMapper.convertValue(cached, MultipartUploadSession.class);
            return Optional.ofNullable(session);
        } catch (Exception e) {
            log.error("Failed to deserialize multipart upload session from Redis for key: {}", key, e);
            return Optional.empty();
        }
    }

    @Override
    public void delete(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }
        String key = buildCacheKey(sessionId);
        redisTemplate.delete(key);
        log.info("Deleted multipart upload session from Redis: key={}", key);
    }

    private String buildCacheKey(String sessionId) {
        return RedisPrefixConstant.FILE_MULTIPART_SESSION_PREFIX + sessionId;
    }
}
