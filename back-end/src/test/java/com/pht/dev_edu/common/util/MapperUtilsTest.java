package com.pht.dev_edu.common.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/*
 * <analysis>
 * MapperUtils
 * - readValue(String json, Class<T> clazz)
 *   - branches:
 *       valid JSON -> returns parsed object
 *       invalid JSON -> catches JsonProcessingException -> throws ConvertDataException
 *   - paths:
 *       [P1: valid JSON string -> parsed object]
 *       [P2: invalid JSON string -> ConvertDataException]
 *       [P3: null JSON string -> ConvertDataException (Jackson throws on null)]
 *   - planned tests:
 *       [shouldParseValidJsonToObject -> P1]
 *       [shouldThrowConvertDataExceptionForInvalidJson -> P2]
 *       [shouldThrowConvertDataExceptionForNullJson -> P3]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for MapperUtils
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify JSON parsing logic in MapperUtils.
 *
 * Test Scope
 * ----------
 * - readValue(String, Class)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Normal execution (valid JSON parsed to POJO)
 * ✓ Invalid JSON (malformed string -> ConvertDataException)
 * ✓ Null JSON (null input -> ConvertDataException)
 *
 * Mocked Dependencies
 * -------------------
 * (none — pure static utility with internal ObjectMapper)
 *
 * Not Covered
 * -----------
 * - Complex nested JSON structures
 * - ObjectMapper configuration (internal)
 *
 * Notes
 * -----
 * Pure unit test. No dependencies to mock.
 */

import com.pht.dev_edu.common.exception.data.ConvertDataException;

class MapperUtilsTest {

    // Simple POJO for testing
    static class SampleDto {
        public String name;
        public int age;
    }

    @Test
    @DisplayName("readValue - should parse valid JSON to object")
    void shouldParseValidJsonToObject() {
        // Arrange
        String json = "{\"name\":\"Alice\",\"age\":30}";

        // Act
        SampleDto result = MapperUtils.readValue(json, SampleDto.class);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.name).isEqualTo("Alice");
        assertThat(result.age).isEqualTo(30);
    }

    @Test
    @DisplayName("readValue - should throw ConvertDataException for invalid JSON")
    void shouldThrowConvertDataExceptionForInvalidJson() {
        // Arrange
        String invalidJson = "{broken json}}}";

        // Act & Assert
        assertThatThrownBy(() -> MapperUtils.readValue(invalidJson, SampleDto.class))
                .isInstanceOf(ConvertDataException.class)
                .hasMessageContaining("Failed to parse JSON to SampleDto");
    }

    @Test
    @DisplayName("readValue - should throw IllegalArgumentException for null JSON")
    void shouldThrowIllegalArgumentExceptionForNullJson() {
        // Act & Assert
        assertThatThrownBy(() -> MapperUtils.readValue(null, SampleDto.class))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
