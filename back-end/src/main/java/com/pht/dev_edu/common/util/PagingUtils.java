package com.pht.dev_edu.common.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

/**
 * Utility class for handling pagination.
 * Provides a method to create a Pageable object with validation and sorting.
 */
public class PagingUtils {
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

    public static <T> String getNextTimeCursor(
            Page<T> page,
            Function<T, LocalDateTime> getTime,
            Function<T, UUID> getId
    ) {
        var content = page.getContent();
        if (content.isEmpty()) return null;

        var lastItem = content.getLast();

        return PagingUtils.encodeTimeStampCursor(
                new TimeStampCursor(getTime.apply(lastItem), getId.apply(lastItem))
        );
    }

    public static <T, R> CustomPaging<R> getPagedWithCursor(
            Page<T> page,
            Function<T, R> mapper,
            Function<T, LocalDateTime> getTime,
            Function<T, UUID> getId,
            int requestedPageSize // Truyền vào số lượng item thực tế user muốn (n)
    ) {
        List<T> content = page.getContent();
        boolean hasNext = content.size() > requestedPageSize;
        List<T> finalContent = hasNext
                ? content.subList(0, requestedPageSize)
                : content;

        Pageable newPageable = PageRequest.of(
                page.getNumber(),
                requestedPageSize,
                page.getSort()
        );

        var result = new CustomPaging<>(finalContent, mapper, newPageable);
        result.setTotalPages(page.getTotalPages());
        result.setTotalElements(page.getTotalElements());

        if (hasNext) {
            var nextCursor = PagingUtils.getNextTimeCursor(page, getTime, getId);
            result.setNextCursor(nextCursor);
        }

        return result;
    }
}
