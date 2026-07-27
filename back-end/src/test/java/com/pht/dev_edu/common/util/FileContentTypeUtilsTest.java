package com.pht.dev_edu.common.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/*
 * <analysis>
 * FileContentTypeUtils
 * - isValidContentType(String contentType, FileType... allowedTypes)
 *   - branches:
 *       if !StringUtils.hasText(contentType) || allowedTypes == null || allowedTypes.length == 0 -> return false
 *       for each allowedType in switch:
 *           DOCUMENT -> check PDFS/WORDS/EXCELS/POWERPOINTS/TEXTS
 *           IMAGE -> check IMAGES
 *           VIDEO -> check VIDEOS
 *           AUDIO -> check AUDIOS
 *           ARCHIVE -> check ARCHIVES
 *       none match -> return false
 *   - paths:
 *       [P1: contentType is null/blank -> false]
 *       [P2: allowedTypes is null -> false]
 *       [P3: allowedTypes is empty -> false]
 *       [P4: IMAGE type, valid image contentType -> true]
 *       [P5: IMAGE type, non-image contentType -> false]
 *       [P6: VIDEO type, valid video contentType -> true]
 *       [P7: AUDIO type, valid audio contentType -> true]
 *       [P8: ARCHIVE type, valid archive contentType -> true]
 *       [P9: DOCUMENT type, valid PDF contentType -> true]
 *       [P10: DOCUMENT type, valid Word contentType -> true]
 *       [P11: DOCUMENT type, valid text contentType -> true]
 *       [P12: multiple allowedTypes, match on second type -> true]
 *   - Note: P9/P10/P11 are distinct sub-branches within DOCUMENT. P2 and P3 are distinct
 *           guard clause inputs. P6/P7/P8 test distinct switch arms.
 *   - planned tests:
 *       [shouldReturnFalseWhenContentTypeIsNull -> P1]
 *       [shouldReturnFalseWhenContentTypeIsBlank -> P1 variant (same branch, merged)]
 *       Note: P1 variants merged into one test since both hit same guard.
 *       [shouldReturnFalseWhenAllowedTypesIsNull -> P2]
 *       [shouldReturnFalseWhenAllowedTypesIsEmpty -> P3]
 *       [shouldReturnTrueForValidImageContentType -> P4]
 *       [shouldReturnFalseForNonImageContentType -> P5]
 *       [shouldReturnTrueForValidVideoContentType -> P6]
 *       [shouldReturnTrueForValidAudioContentType -> P7]
 *       [shouldReturnTrueForValidArchiveContentType -> P8]
 *       [shouldReturnTrueForValidDocumentPdfContentType -> P9]
 *       [shouldReturnTrueForValidDocumentWordContentType -> P10]
 *       [shouldReturnTrueForValidDocumentTextContentType -> P11]
 *       [shouldReturnTrueWhenMatchFoundInSecondAllowedType -> P12]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for FileContentTypeUtils
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify content type validation logic in FileContentTypeUtils.
 *
 * Test Scope
 * ----------
 * - isValidContentType()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Normal execution (valid content types for each FileType)
 * ✓ Invalid input (non-matching content type)
 * ✓ Null values (null contentType, null allowedTypes)
 * ✓ Empty values (blank contentType, empty allowedTypes array)
 * ✓ Branch conditions (each switch arm: DOCUMENT, IMAGE, VIDEO, AUDIO, ARCHIVE)
 * ✓ Multiple allowed types
 *
 * Mocked Dependencies
 * -------------------
 * (none — pure static utility)
 *
 * Not Covered
 * -----------
 * - Database integration
 * - Spring Context
 *
 * Notes
 * -----
 * Pure unit test. No dependencies to mock.
 */

import com.pht.dev_edu.common.util.FileContentTypeUtils.FileType;

class FileContentTypeUtilsTest {

    // ==================== Guard clauses ====================

    @Test
    @DisplayName("isValidContentType - should return false when contentType is null or blank")
    void shouldReturnFalseWhenContentTypeIsNullOrBlank() {
        // Arrange & Act & Assert
        assertThat(FileContentTypeUtils.isValidContentType(null, FileType.IMAGE)).isFalse();
        assertThat(FileContentTypeUtils.isValidContentType("", FileType.IMAGE)).isFalse();
        assertThat(FileContentTypeUtils.isValidContentType("  ", FileType.IMAGE)).isFalse();

        // Verify — no side effects to verify
    }

    @Test
    @DisplayName("isValidContentType - should return false when allowedTypes is null")
    void shouldReturnFalseWhenAllowedTypesIsNull() {
        // Arrange & Act
        boolean result = FileContentTypeUtils.isValidContentType("image/png", (FileType[]) null);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("isValidContentType - should return false when allowedTypes is empty")
    void shouldReturnFalseWhenAllowedTypesIsEmpty() {
        // Arrange & Act
        boolean result = FileContentTypeUtils.isValidContentType("image/png");

        // Assert
        assertThat(result).isFalse();
    }

    // ==================== IMAGE ====================

    @Test
    @DisplayName("isValidContentType - should return true for valid image content type")
    void shouldReturnTrueForValidImageContentType() {
        // Arrange & Act & Assert
        assertThat(FileContentTypeUtils.isValidContentType("image/jpeg", FileType.IMAGE)).isTrue();
        assertThat(FileContentTypeUtils.isValidContentType("image/png", FileType.IMAGE)).isTrue();
        assertThat(FileContentTypeUtils.isValidContentType("image/webp", FileType.IMAGE)).isTrue();
    }

    @Test
    @DisplayName("isValidContentType - should return false for non-image content type when IMAGE required")
    void shouldReturnFalseForNonImageContentType() {
        // Arrange & Act
        boolean result = FileContentTypeUtils.isValidContentType("application/pdf", FileType.IMAGE);

        // Assert
        assertThat(result).isFalse();
    }

    // ==================== VIDEO ====================

    @Test
    @DisplayName("isValidContentType - should return true for valid video content type")
    void shouldReturnTrueForValidVideoContentType() {
        // Arrange & Act
        boolean result = FileContentTypeUtils.isValidContentType("video/mp4", FileType.VIDEO);

        // Assert
        assertThat(result).isTrue();
    }

    // ==================== AUDIO ====================

    @Test
    @DisplayName("isValidContentType - should return true for valid audio content type")
    void shouldReturnTrueForValidAudioContentType() {
        // Arrange & Act
        boolean result = FileContentTypeUtils.isValidContentType("audio/mpeg", FileType.AUDIO);

        // Assert
        assertThat(result).isTrue();
    }

    // ==================== ARCHIVE ====================

    @Test
    @DisplayName("isValidContentType - should return true for valid archive content type")
    void shouldReturnTrueForValidArchiveContentType() {
        // Arrange & Act
        boolean result = FileContentTypeUtils.isValidContentType("application/zip", FileType.ARCHIVE);

        // Assert
        assertThat(result).isTrue();
    }

    // ==================== DOCUMENT ====================

    @Test
    @DisplayName("isValidContentType - should return true for PDF content type under DOCUMENT")
    void shouldReturnTrueForValidDocumentPdfContentType() {
        // Arrange & Act
        boolean result = FileContentTypeUtils.isValidContentType("application/pdf", FileType.DOCUMENT);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("isValidContentType - should return true for Word content type under DOCUMENT")
    void shouldReturnTrueForValidDocumentWordContentType() {
        // Arrange & Act
        boolean result = FileContentTypeUtils.isValidContentType(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                FileType.DOCUMENT);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("isValidContentType - should return true for text content type under DOCUMENT")
    void shouldReturnTrueForValidDocumentTextContentType() {
        // Arrange & Act
        boolean result = FileContentTypeUtils.isValidContentType("text/plain", FileType.DOCUMENT);

        // Assert
        assertThat(result).isTrue();
    }

    // ==================== Multiple types ====================

    @Test
    @DisplayName("isValidContentType - should return true when match found in second allowed type")
    void shouldReturnTrueWhenMatchFoundInSecondAllowedType() {
        // Arrange — video/mp4 does not match IMAGE, but matches VIDEO
        // Act
        boolean result = FileContentTypeUtils.isValidContentType("video/mp4", FileType.IMAGE, FileType.VIDEO);

        // Assert
        assertThat(result).isTrue();
    }
}
