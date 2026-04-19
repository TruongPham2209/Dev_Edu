package com.pht.dev_edu.common.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;
import java.util.function.Supplier;


@Component
public class RedisUtils {

    private static RedisTemplate<String, Object> redisTemplate;
    private static ObjectMapper objectMapper;

    public RedisUtils(RedisTemplate<String, Object> redisTemplate,
                      ObjectMapper objectMapper) {
        RedisUtils.redisTemplate = redisTemplate;
        RedisUtils.objectMapper = objectMapper;
    }

    public static <T> T getDataFromCacheOrDb(
            String cacheKey,
            Class<T> clazz,
            Supplier<Optional<T>> dbCall,
            Duration ttl
    ) {
        Object cached = redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            return objectMapper.convertValue(cached, clazz);
        }

        Optional<T> optionalData = dbCall.get();

        if (optionalData.isPresent()) {
            T data = optionalData.get();
            redisTemplate.opsForValue().set(cacheKey, data, ttl);
            return data;
        }

        return null;
    }

    public static void invalidateCache(String cacheKey) {
        redisTemplate.delete(cacheKey);
    }

    public static void updateCache(String cacheKey, Object data, Duration ttl) {
        redisTemplate.opsForValue().set(cacheKey, data, ttl);
    }
}