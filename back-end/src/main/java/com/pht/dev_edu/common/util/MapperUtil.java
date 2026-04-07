package com.pht.dev_edu.common.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.exception.data.ConvertDataException;

import lombok.extern.slf4j.Slf4j;

/**
 * Utility class for JSON processing using Jackson ObjectMapper.
 */
@Slf4j
public class MapperUtil {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /**
     * Converts a JSON string to an object of the specified class.
     *
     * @param json  The JSON string.
     * @param clazz The target class.
     * @param <T>   The type of the returned object.
     * @return The parsed object.
     * @throws RuntimeException if JSON parsing fails.
     */
    public static <T> T readValue(String json, Class<T> clazz) {
        try {
            return MAPPER.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse JSON: {}", e.getMessage(), e);
            throw new ConvertDataException("Failed to parse JSON to " + clazz.getSimpleName());
        }
    }
}
