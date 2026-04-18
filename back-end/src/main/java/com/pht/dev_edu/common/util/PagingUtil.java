package com.pht.dev_edu.common.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;

/**
 * Utility class for handling pagination.
 * Provides a method to create a Pageable object with validation and sorting.
 */
public class PagingUtil {
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    /**
     * Creates a pageable object with the given page, page size, and optional sorting parameters.
     *
     * @param page     The requested page number (0-based). If negative, defaults to 0.
     * @param pageSize The requested page size. If invalid (<= 0 or > 50), defaults to 10.
     * @param sorts    Optional sorting criteria.
     * @return A {@link Pageable} instance with the given parameters.
     */
    public static Pageable getPageable(int page, int pageSize, Sort... sorts) {
        if (page < 0)
            page = 0;

        if (pageSize <= 0 || pageSize > 50)
            pageSize = 10;

        Sort sort = Sort.unsorted();
        if (sorts != null && sorts.length > 0) {
            sort = Arrays.stream(sorts)
                    .reduce(Sort::and)
                    .orElse(Sort.unsorted());
        }

        return PageRequest.of(page, pageSize, sort);
    }

    public static Pageable getPageable(int pageSize, Sort... sorts) {
        return getPageable(0, pageSize, sorts);
    }

    public static String encodeTimeStampCursor(TimeStampCursor cursor) {
        try {
            String json = objectMapper.writeValueAsString(cursor);
            return Base64.getUrlEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to encode cursor", e);
        }
    }

    public static TimeStampCursor decodeTimeStampCursor(String encodedCursor) {
        try {
            byte[] decodedBytes = Base64.getUrlDecoder().decode(encodedCursor);
            String json = new String(decodedBytes, StandardCharsets.UTF_8);
            return objectMapper.readValue(json, TimeStampCursor.class);
        } catch (IllegalArgumentException | JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid cursor format", e);
        }
    }
}
