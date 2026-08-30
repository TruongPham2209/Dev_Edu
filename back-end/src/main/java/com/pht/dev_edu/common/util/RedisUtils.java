package com.pht.dev_edu.common.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;
import java.util.function.Supplier;

/**
 * Utility component for Redis cache operations (Look-Aside / Cache-Aside caching patterns).
 */
@Component
public class RedisUtils {

    private static RedisTemplate<String, Object> redisTemplate;
    private static ObjectMapper objectMapper;

    public RedisUtils(RedisTemplate<String, Object> redisTemplate,
                      ObjectMapper objectMapper) {
        RedisUtils.redisTemplate = redisTemplate;
        RedisUtils.objectMapper = objectMapper;
    }

    /**
     * Retrieves optional data from Redis cache or fetches from database and populates cache if present.
     *
     * @param <T>      the entity type.
     * @param cacheKey the Redis cache key.
     * @param clazz    the target class type.
     * @param dbCall   the database fallback supplier returning {@link Optional}.
     * @param ttl      the time-to-live duration for the cached entry.
     * @return the resolved data or null if not found.
     */
    public static <T> T getOptionalDataFromCacheOrDb(
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

    /**
     * Retrieves data from Redis cache or executes the DB call and caches the non-null result.
     *
     * @param <T>      the entity type.
     * @param cacheKey the Redis cache key.
     * @param clazz    the target class type.
     * @param dbCall   the database fallback supplier.
     * @param ttl      the time-to-live duration for the cached entry.
     * @return the resolved data or null if not found.
     */
    public static <T> T getDataFromCacheOrDb(
            String cacheKey,
            Class<T> clazz,
            Supplier<T> dbCall,
            Duration ttl
    ) {
        Object cached = redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            return objectMapper.convertValue(cached, clazz);
        }

        T data = dbCall.get();

        if (data != null) {
            redisTemplate.opsForValue().set(cacheKey, data, ttl);
            return data;
        }

        return null;
    }

    /**
     * Evicts a key from the Redis cache.
     *
     * @param cacheKey the key to delete.
     */
    public static void invalidateCache(String cacheKey) {
        redisTemplate.delete(cacheKey);
    }

    /**
     * Directly puts/updates a key-value entry in Redis cache with an expiration TTL.
     *
     * @param cacheKey the Redis key.
     * @param data     the payload object to cache.
     * @param ttl      the time-to-live duration.
     */
    public static void updateCache(String cacheKey, Object data, Duration ttl) {
        redisTemplate.opsForValue().set(cacheKey, data, ttl);
    }
}
