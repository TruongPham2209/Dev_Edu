package com.pht.dev_edu.common.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/*
 * <analysis>
 * PagingUtils
 * - getPageable(int page, int pageSize, Sort... sorts)
 *   - branches:
 *       if page < 0 -> page = 0
 *       if pageSize <= 0 || pageSize > 50 -> pageSize = 10
 *       if sorts != null && sorts.length > 0 -> combine sorts
 *       else -> Sort.unsorted
 *   - paths:
 *       [P1: negative page -> defaults to 0]
 *       [P2: zero pageSize -> defaults to 10]
 *       [P3: pageSize > 50 -> defaults to 10]
 *       [P4: valid page and pageSize, no sorts -> returns Pageable with unsorted]
 *       [P5: valid page and pageSize, with sorts -> returns Pageable with combined sort]
 *   - planned tests:
 *       [shouldDefaultPageToZeroWhenNegative -> P1]
 *       [shouldDefaultPageSizeToTenWhenZeroOrNegative -> P2]
 *       [shouldDefaultPageSizeToTenWhenGreaterThanFifty -> P3]
 *       [shouldReturnPageableWithUnsortedWhenNoSorts -> P4]
 *       [shouldReturnPageableWithCombinedSort -> P5]
 *
 * - getPageable(int pageSize, Sort... sorts)
 *   - branches: delegates to getPageable(0, pageSize, sorts)
 *   - paths: [P1: delegation with page=0]
 *   - planned tests: [shouldDelegateToOverloadWithPageZero -> P1]
 *
 * - encodeTimeStampCursor(TimeStampCursor cursor) / decodeTimeStampCursor(String)
 *   - branches:
 *       encode success / decode success
 *       decode invalid input -> IllegalArgumentException
 *   - paths:
 *       [P1: encode then decode roundtrip -> same cursor]
 *       [P2: decode invalid string -> IllegalArgumentException]
 *   - planned tests:
 *       [shouldEncodeAndDecodeTimeStampCursorRoundTrip -> P1]
 *       [shouldThrowExceptionWhenDecodingInvalidCursor -> P2]
 *
 * - getNextTimeCursor(List, Function, Function)
 *   - branches:
 *       if content.isEmpty() -> return null
 *       else -> encode last item
 *   - paths:
 *       [P1: empty list -> null]
 *       [P2: non-empty list -> encoded cursor string]
 *   - planned tests:
 *       [shouldReturnNullWhenContentIsEmpty -> P1]
 *       [shouldReturnEncodedCursorForLastItem -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for PagingUtils
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify pagination utility logic in PagingUtils.
 *
 * Test Scope
 * ----------
 * - getPageable(int, int, Sort...)
 * - getPageable(int, Sort...)
 * - encodeTimeStampCursor()
 * - decodeTimeStampCursor()
 * - getNextTimeCursor()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Normal execution (valid inputs)
 * ✓ Boundary values (page < 0, pageSize 0, pageSize > 50)
 * ✓ Empty values (empty list for cursor)
 * ✓ Exception paths (invalid cursor decoding)
 * ✓ Roundtrip encoding/decoding
 *
 * Mocked Dependencies
 * -------------------
 * (none — pure static utility)
 *
 * Not Covered
 * -----------
 * - getPagedWithCursor() overloads (integration-heavy, requires Page objects with realistic content)
 * - Database integration
 * - Spring Context
 *
 * Notes
 * -----
 * Pure unit test. No dependencies to mock.
 */

import com.pht.dev_edu.common.dto.TimeStampCursor;

class PagingUtilsTest {

    // ==================== getPageable(page, pageSize, sorts) ====================

    @Test
    @DisplayName("getPageable - should default page to 0 when negative")
    void shouldDefaultPageToZeroWhenNegative() {
        // Arrange & Act
        Pageable pageable = PagingUtils.getPageable(-5, 10);

        // Assert
        assertThat(pageable.getPageNumber()).isZero();
        assertThat(pageable.getPageSize()).isEqualTo(10);
    }

    @Test
    @DisplayName("getPageable - should default pageSize to 10 when zero or negative")
    void shouldDefaultPageSizeToTenWhenZeroOrNegative() {
        // Arrange & Act
        Pageable pageable = PagingUtils.getPageable(0, 0);

        // Assert
        assertThat(pageable.getPageSize()).isEqualTo(10);

        // Verify negative case too
        Pageable pageable2 = PagingUtils.getPageable(0, -1);
        assertThat(pageable2.getPageSize()).isEqualTo(10);
    }

    @Test
    @DisplayName("getPageable - should default pageSize to 10 when greater than 50")
    void shouldDefaultPageSizeToTenWhenGreaterThanFifty() {
        // Arrange & Act
        Pageable pageable = PagingUtils.getPageable(0, 51);

        // Assert
        assertThat(pageable.getPageSize()).isEqualTo(10);
    }

    @Test
    @DisplayName("getPageable - should return Pageable with unsorted when no sorts provided")
    void shouldReturnPageableWithUnsortedWhenNoSorts() {
        // Arrange & Act
        Pageable pageable = PagingUtils.getPageable(2, 20);

        // Assert
        assertThat(pageable.getPageNumber()).isEqualTo(2);
        assertThat(pageable.getPageSize()).isEqualTo(20);
        assertThat(pageable.getSort()).isEqualTo(Sort.unsorted());
    }

    @Test
    @DisplayName("getPageable - should return Pageable with combined sort when sorts provided")
    void shouldReturnPageableWithCombinedSort() {
        // Arrange
        Sort sort1 = Sort.by(Sort.Direction.ASC, "name");
        Sort sort2 = Sort.by(Sort.Direction.DESC, "createdAt");

        // Act
        Pageable pageable = PagingUtils.getPageable(0, 10, sort1, sort2);

        // Assert
        assertThat(pageable.getSort()).isNotEqualTo(Sort.unsorted());
        assertThat(pageable.getSort().getOrderFor("name")).isNotNull();
        assertThat(pageable.getSort().getOrderFor("name").getDirection()).isEqualTo(Sort.Direction.ASC);
        assertThat(pageable.getSort().getOrderFor("createdAt")).isNotNull();
        assertThat(pageable.getSort().getOrderFor("createdAt").getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    // ==================== getPageable(pageSize, sorts) ====================

    @Test
    @DisplayName("getPageable(pageSize) - should delegate with page = 0")
    void shouldDelegateToOverloadWithPageZero() {
        // Arrange & Act
        Pageable pageable = PagingUtils.getPageable(15);

        // Assert
        assertThat(pageable.getPageNumber()).isZero();
        assertThat(pageable.getPageSize()).isEqualTo(15);
    }

    // ==================== encodeTimeStampCursor / decodeTimeStampCursor
    // ====================

    @Test
    @DisplayName("encode/decode - should roundtrip TimeStampCursor correctly")
    void shouldEncodeAndDecodeTimeStampCursorRoundTrip() {
        // Arrange
        UUID id = UUID.randomUUID();
        LocalDateTime time = LocalDateTime.of(2026, 7, 27, 10, 30, 0);
        TimeStampCursor cursor = new TimeStampCursor(time, id);

        // Act
        String encoded = PagingUtils.encodeTimeStampCursor(cursor);
        TimeStampCursor decoded = PagingUtils.decodeTimeStampCursor(encoded);

        // Assert
        assertThat(decoded.getId()).isEqualTo(id);
        assertThat(decoded.getTimeStamp()).isEqualTo(time);
    }

    @Test
    @DisplayName("decode - should throw IllegalArgumentException for invalid cursor")
    void shouldThrowExceptionWhenDecodingInvalidCursor() {
        // Arrange
        String invalidCursor = "not-a-valid-base64-json";

        // Act & Assert
        assertThatThrownBy(() -> PagingUtils.decodeTimeStampCursor(invalidCursor))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid cursor format");
    }

    // ==================== getNextTimeCursor ====================

    @Test
    @DisplayName("getNextTimeCursor - should return null when content is empty")
    void shouldReturnNullWhenContentIsEmpty() {
        // Arrange & Act
        String result = PagingUtils.getNextTimeCursor(
                Collections.emptyList(),
                item -> LocalDateTime.now(),
                item -> UUID.randomUUID());

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("getNextTimeCursor - should return encoded cursor for last item in list")
    void shouldReturnEncodedCursorForLastItem() {
        // Arrange
        UUID id = UUID.randomUUID();
        LocalDateTime time = LocalDateTime.of(2026, 1, 15, 12, 0, 0);

        record TestItem(UUID id, LocalDateTime createdAt) {
        }
        List<TestItem> items = List.of(
                new TestItem(UUID.randomUUID(), LocalDateTime.of(2026, 1, 14, 12, 0, 0)),
                new TestItem(id, time));

        // Act
        String result = PagingUtils.getNextTimeCursor(items, TestItem::createdAt, TestItem::id);

        // Assert
        assertThat(result).isNotNull();
        TimeStampCursor decoded = PagingUtils.decodeTimeStampCursor(result);
        assertThat(decoded.getId()).isEqualTo(id);
        assertThat(decoded.getTimeStamp()).isEqualTo(time);
    }
}
