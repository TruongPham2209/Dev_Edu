package com.pht.dev_edu.common.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.exception.data.ConvertDataException;

import lombok.extern.slf4j.Slf4j;

/**
 * Utility class for JSON parsing and serialization using Jackson {@link ObjectMapper}.
 */
@Slf4j
public class MapperUtils {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /**
     * Deserializes a JSON string into an object of the specified target class.
     *
     * @param json  the JSON string to parse.
     * @param clazz the target class type.
     * @param <T>   the generic type of the returned object.
     * @return the deserialized object instance.
     * @throws ConvertDataException if JSON parsing fails.
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
