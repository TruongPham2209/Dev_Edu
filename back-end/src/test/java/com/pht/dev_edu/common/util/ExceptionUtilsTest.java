package com.pht.dev_edu.common.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;

/*
 * <analysis>
 * ExceptionUtils
 * - getClientErrorMessage(Exception ex)
 *   - branches:
 *       MethodArgumentTypeMismatchException -> "Invalid input params."
 *       MethodArgumentNotValidException -> "Invalid input data."
 *       MissingServletRequestPartException -> "Request body is missing."
 *       MissingServletRequestParameterException -> "Missing required request parameter."
 *       ConstraintViolationException -> "Invalid input data."
 *       BindException -> "Invalid input data."
 *       null/default -> "Bad request."
 *   - paths:
 *       [P1: MethodArgumentTypeMismatchException]
 *       [P2: MethodArgumentNotValidException]
 *       [P3: MissingServletRequestPartException]
 *       [P4: MissingServletRequestParameterException]
 *       [P5: ConstraintViolationException]
 *       [P6: BindException]
 *       [P7: null]
 *       [P8: default/generic Exception]
 *   - planned tests:
 *       [shouldReturnInvalidInputParamsForTypeMismatch -> P1]
 *       [shouldReturnInvalidInputDataForMethodArgumentNotValid -> P2]
 *       [shouldReturnRequestBodyMissingForMissingPart -> P3]
 *       [shouldReturnMissingParamForMissingParameter -> P4]
 *       [shouldReturnInvalidInputDataForConstraintViolation -> P5]
 *       [shouldReturnInvalidInputDataForBindException -> P6]
 *       [shouldReturnBadRequestForNull -> P7]
 *       [shouldReturnBadRequestForGenericException -> P8]
 *
 * - getMethodNotAllowedMessage(Exception ex)
 *   - branches:
 *       UnsupportedOperationException -> "This operation is not supported."
 *       HttpRequestMethodNotSupportedException -> "Method not allowed."
 *       else -> "Method not allowed."
 *   - paths: [P1: UnsupportedOp] [P2: HttpMethodNotSupported] [P3: generic]
 *   - planned tests:
 *       [shouldReturnNotSupportedForUnsupportedOperation -> P1]
 *       [shouldReturnMethodNotAllowedForHttpMethodNotSupported -> P2]
 *       [shouldReturnMethodNotAllowedForGenericException -> P3]
 *
 * - getServerErrorMessage(Exception ex)
 *   - branches: IOException / IllegalStateException / else
 *   - paths: [P1: IO] [P2: IllegalState] [P3: generic]
 *   - planned tests:
 *       [shouldReturnIoErrorForIOException -> P1]
 *       [shouldReturnInvalidStateForIllegalStateException -> P2]
 *       [shouldReturnInternalServerErrorForGenericException -> P3]
 *
 * - getConflictErrorMessage(Exception ex)
 *   - branches: DataIntegrityViolationException / else
 *   - paths: [P1: DataIntegrity] [P2: generic]
 *   - planned tests:
 *       [shouldReturnDataConstraintViolationForDataIntegrity -> P1]
 *       [shouldReturnConflictErrorForGenericException -> P2]
 *
 * - getStackTraceAsString(Exception ex)
 *   - paths: [P1: success -> formatted string]
 *   - planned tests:
 *       [shouldReturnFormattedStackTrace -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for ExceptionUtils
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify exception-to-message mapping logic in ExceptionUtils.
 *
 * Test Scope
 * ----------
 * - getClientErrorMessage() (8 switch arms)
 * - getMethodNotAllowedMessage() (3 branches)
 * - getServerErrorMessage() (3 branches)
 * - getConflictErrorMessage() (2 branches)
 * - getStackTraceAsString()
 *
 * Covered Scenarios
 * -----------------
 * ✓ All switch/if-else branches for each method
 * ✓ Null exception input
 * ✓ Stack trace formatting
 *
 * Mocked Dependencies
 * -------------------
 * (none — pure static utility)
 *
 * Not Covered
 * -----------
 * - Log output verification (Slf4j)
 *
 * Notes
 * -----
 * Pure unit test. No dependencies to mock.
 */

class ExceptionUtilsTest {

    // ==================== getClientErrorMessage ====================

    @Test
    @DisplayName("getClientErrorMessage - should return 'Invalid input params.' for MethodArgumentTypeMismatchException")
    void shouldReturnInvalidInputParamsForTypeMismatch() {
        // Arrange
        MethodParameter param = mock(MethodParameter.class);
        var ex = new MethodArgumentTypeMismatchException(
                "badValue", Integer.class, "id", param, new RuntimeException("parse error"));

        // Act
        String result = ExceptionUtils.getClientErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Invalid input params.");
    }

    @Test
    @DisplayName("getClientErrorMessage - should return 'Request body is missing.' for MissingServletRequestPartException")
    void shouldReturnRequestBodyMissingForMissingPart() {
        // Arrange
        var ex = new MissingServletRequestPartException("file");

        // Act
        String result = ExceptionUtils.getClientErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Request body is missing.");
    }

    @Test
    @DisplayName("getClientErrorMessage - should return 'Missing required request parameter.' for MissingServletRequestParameterException")
    void shouldReturnMissingParamForMissingParameter() {
        // Arrange
        var ex = new MissingServletRequestParameterException("page", "int");

        // Act
        String result = ExceptionUtils.getClientErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Missing required request parameter.");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getClientErrorMessage - should return 'Invalid input data.' for ConstraintViolationException")
    void shouldReturnInvalidInputDataForConstraintViolation() {
        // Arrange
        ConstraintViolation<Object> violation = mock(ConstraintViolation.class);
        Path path = mock(Path.class);
        when(path.toString()).thenReturn("email");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("must not be blank");
        when(violation.getInvalidValue()).thenReturn(null);

        var ex = new ConstraintViolationException(Set.of(violation));

        // Act
        String result = ExceptionUtils.getClientErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Invalid input data.");
    }

    @Test
    @DisplayName("getClientErrorMessage - should return 'Invalid input data.' for BindException")
    void shouldReturnInvalidInputDataForBindException() {
        // Arrange
        BindException ex = new BindException(new Object(), "target");
        ex.addError(new FieldError("target", "name", "must not be null"));

        // Act
        String result = ExceptionUtils.getClientErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Invalid input data.");
    }

    @Test
    @DisplayName("getClientErrorMessage - should return 'Bad request.' for null exception")
    void shouldReturnBadRequestForNull() {
        // Act
        String result = ExceptionUtils.getClientErrorMessage(null);

        // Assert
        assertThat(result).isEqualTo("Bad request.");
    }

    @Test
    @DisplayName("getClientErrorMessage - should return 'Bad request.' for generic exception")
    void shouldReturnBadRequestForGenericException() {
        // Arrange
        var ex = new RuntimeException("something unexpected");

        // Act
        String result = ExceptionUtils.getClientErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Bad request.");
    }

    // ==================== getMethodNotAllowedMessage ====================

    @Test
    @DisplayName("getMethodNotAllowedMessage - should return 'This operation is not supported.' for UnsupportedOperationException")
    void shouldReturnNotSupportedForUnsupportedOperation() {
        // Arrange
        var ex = new UnsupportedOperationException("not impl");

        // Act
        String result = ExceptionUtils.getMethodNotAllowedMessage(ex);

        // Assert
        assertThat(result).isEqualTo("This operation is not supported.");
    }

    @Test
    @DisplayName("getMethodNotAllowedMessage - should return 'Method not allowed.' for HttpRequestMethodNotSupportedException")
    void shouldReturnMethodNotAllowedForHttpMethodNotSupported() {
        // Arrange
        var ex = new HttpRequestMethodNotSupportedException("PATCH", List.of("GET", "POST"));

        // Act
        String result = ExceptionUtils.getMethodNotAllowedMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Method not allowed.");
    }

    @Test
    @DisplayName("getMethodNotAllowedMessage - should return 'Method not allowed.' for generic exception")
    void shouldReturnMethodNotAllowedForGenericException() {
        // Arrange
        var ex = new RuntimeException("some error");

        // Act
        String result = ExceptionUtils.getMethodNotAllowedMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Method not allowed.");
    }

    // ==================== getServerErrorMessage ====================

    @Test
    @DisplayName("getServerErrorMessage - should return I/O error message for IOException")
    void shouldReturnIoErrorForIOException() {
        // Arrange
        var ex = new IOException("disk full");

        // Act
        String result = ExceptionUtils.getServerErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("An I/O error occurred while processing the request.");
    }

    @Test
    @DisplayName("getServerErrorMessage - should return invalid state message for IllegalStateException")
    void shouldReturnInvalidStateForIllegalStateException() {
        // Arrange
        var ex = new IllegalStateException("bad state");

        // Act
        String result = ExceptionUtils.getServerErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("The system is in an invalid state to process the request.");
    }

    @Test
    @DisplayName("getServerErrorMessage - should return internal server error for generic exception")
    void shouldReturnInternalServerErrorForGenericException() {
        // Arrange
        var ex = new RuntimeException("unknown");

        // Act
        String result = ExceptionUtils.getServerErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Internal server error.");
    }

    // ==================== getConflictErrorMessage ====================

    @Test
    @DisplayName("getConflictErrorMessage - should return 'Data constraint violation.' for DataIntegrityViolationException")
    void shouldReturnDataConstraintViolationForDataIntegrity() {
        // Arrange
        var ex = new DataIntegrityViolationException("unique key violated");

        // Act
        String result = ExceptionUtils.getConflictErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Data constraint violation.");
    }

    @Test
    @DisplayName("getConflictErrorMessage - should return 'Conflict error.' for generic exception")
    void shouldReturnConflictErrorForGenericException() {
        // Arrange
        var ex = new RuntimeException("conflict");

        // Act
        String result = ExceptionUtils.getConflictErrorMessage(ex);

        // Assert
        assertThat(result).isEqualTo("Conflict error.");
    }

    // ==================== getStackTraceAsString ====================

    @Test
    @DisplayName("getStackTraceAsString - should return formatted stack trace string")
    void shouldReturnFormattedStackTrace() {
        // Arrange
        var ex = new RuntimeException("test error");

        // Act
        String result = ExceptionUtils.getStackTraceAsString(ex);

        // Assert
        assertThat(result).isNotEmpty();
        assertThat(result).contains("ExceptionUtilsTest");
    }
}
