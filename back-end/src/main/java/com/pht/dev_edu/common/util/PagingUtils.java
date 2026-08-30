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
 * Utility class for creating Spring Data {@link Pageable} instances and handling cursor-based pagination tokens.
 */
public class PagingUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    /**
     * Creates a {@link Pageable} instance with page validation, bounds check, and optional sort criteria.
     *
     * @param page     the requested 0-indexed page number (defaults to 0 if negative).
     * @param pageSize the requested page size (defaults to 10 if <= 0 or > 50).
     * @param sorts    optional {@link Sort} criteria to apply.
     * @return the configured {@link Pageable} object.
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

    /**
     * Creates a {@link Pageable} instance for the first page with the given page size and sorts.
     *
     * @param pageSize the requested page size.
     * @param sorts    optional {@link Sort} criteria.
     * @return the configured {@link Pageable} object.
     */
    public static Pageable getPageable(int pageSize, Sort... sorts) {
        return getPageable(0, pageSize, sorts);
    }

    /**
     * Encodes a {@link TimeStampCursor} object into a URL-safe Base64 cursor token string.
     *
     * @param cursor the cursor instance containing timestamp and item ID.
     * @return the URL-safe Base64 encoded string.
     */
    public static String encodeTimeStampCursor(TimeStampCursor cursor) {
        try {
            String json = objectMapper.writeValueAsString(cursor);
            return Base64.getUrlEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to encode cursor", e);
        }
    }

    /**
     * Decodes a URL-safe Base64 cursor token string back into a {@link TimeStampCursor} object.
     *
     * @param encodedCursor the encoded cursor token string.
     * @return the parsed {@link TimeStampCursor} instance.
     */
    public static TimeStampCursor decodeTimeStampCursor(String encodedCursor) {
        try {
            byte[] decodedBytes = Base64.getUrlDecoder().decode(encodedCursor);
            String json = new String(decodedBytes, StandardCharsets.UTF_8);
            return objectMapper.readValue(json, TimeStampCursor.class);
        } catch (IllegalArgumentException | JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid cursor format", e);
        }
    }

    /**
     * Generates the encoded next cursor token from the last item in a list.
     *
     * @param <T>     the entity type.
     * @param content the list of items.
     * @param getTime the function extracting the timestamp from an item.
     * @param getId   the function extracting the UUID identifier from an item.
     * @return the encoded cursor token string, or null if the content is empty.
     */
    public static <T> String getNextTimeCursor(
            List<T> content,
            Function<T, LocalDateTime> getTime,
            Function<T, UUID> getId
    ) {
        if (content.isEmpty()) return null;

        var lastItem = content.getLast();

        return PagingUtils.encodeTimeStampCursor(
                new TimeStampCursor(getTime.apply(lastItem), getId.apply(lastItem))
        );
    }

    /**
     * Converts a Spring Data {@link Page} into a {@link CustomPaging} response supporting cursor pagination.
     *
     * @param <T>               the source entity type.
     * @param <R>               the target DTO response type.
     * @param page              the Spring Data page query result.
     * @param mapper            the mapping function converting entity T to DTO R.
     * @param getTime           the function extracting item timestamp.
     * @param getId             the function extracting item UUID.
     * @param requestedPageSize the user-requested page size limit (n).
     * @return the {@link CustomPaging} wrapped response with nextCursor if more items exist.
     */
    public static <T, R> CustomPaging<R> getPagedWithCursor(
            Page<T> page,
            Function<T, R> mapper,
            Function<T, LocalDateTime> getTime,
            Function<T, UUID> getId,
            int requestedPageSize
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
            var nextCursor = PagingUtils.getNextTimeCursor(content, getTime, getId);
            result.setNextCursor(nextCursor);
        }

        return result;
    }

    /**
     * Wraps a raw item list into a {@link CustomPaging} response supporting cursor pagination.
     *
     * @param <T>               the source entity type.
     * @param <R>               the target DTO response type.
     * @param content           the raw list of items fetched (size up to requestedPageSize + 1).
     * @param mapper            the mapping function converting entity T to DTO R.
     * @param getTime           the function extracting item timestamp.
     * @param getId             the function extracting item UUID.
     * @param requestedPageSize the user-requested page size limit.
     * @return the {@link CustomPaging} wrapped response.
     */
    public static <T, R> CustomPaging<R> getPagedWithCursor(
            List<T> content,
            Function<T, R> mapper,
            Function<T, LocalDateTime> getTime,
            Function<T, UUID> getId,
            int requestedPageSize
    ) {
        boolean hasNext = content.size() > requestedPageSize;
        List<T> finalContent = hasNext
                ? content.subList(0, requestedPageSize)
                : content;

        Pageable newPageable = PageRequest.of(
                0,
                requestedPageSize
        );

        var result = new CustomPaging<>(finalContent, mapper, newPageable);

        if (hasNext) {
            var nextCursor = PagingUtils.getNextTimeCursor(content, getTime, getId);
            result.setNextCursor(nextCursor);
        }

        return result;
    }
}
