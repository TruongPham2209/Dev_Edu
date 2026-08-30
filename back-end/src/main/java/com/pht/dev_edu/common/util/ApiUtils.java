package com.pht.dev_edu.common.util;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.exception.AbstractException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Utility class for building standardized RESTful {@link ApiResponse} and {@link ResponseEntity} objects.
 */
@Slf4j
public class ApiUtils {

    /**
     * Constructs a standard success HTTP 200 (OK) response containing payload data.
     *
     * @param data the response payload object.
     * @return a {@link ResponseEntity} wrapping the successful {@link ApiResponse}.
     */
    public static ResponseEntity<ApiResponse> buildSuccessResponse(Object data) {
        ApiResponse response = ApiResponse.builder()
                .success(true)
                .status(org.springframework.http.HttpStatus.OK)
                .message("Request successful")
                .data(data)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.ok(response);
    }

    /**
     * Constructs a standardized error response from an application custom exception.
     *
     * @param ex the {@link AbstractException} containing HTTP status and message.
     * @return a {@link ResponseEntity} wrapping the error {@link ApiResponse}.
     */
    public static ResponseEntity<ApiResponse> buildErrorResponse(AbstractException ex) {
        ApiResponse response = ApiResponse.builder()
                .success(false)
                .status(ex.getHttpStatus())
                .message(ex.getMessage())
                .data(null)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.ok(response);
    }

    /**
     * Constructs a standardized error response with custom message, exception, and HTTP status code.
     *
     * @param message the error message to display.
     * @param ex      the root cause {@link Throwable}.
     * @param status  the {@link HttpStatus} code.
     * @return a {@link ResponseEntity} wrapping the error {@link ApiResponse}.
     */
    public static ResponseEntity<ApiResponse> buildErrorResponse(String message, Throwable ex, HttpStatus status) {
        log.error("Error: {}", message, ex);

        ApiResponse response = ApiResponse.builder()
                .success(false)
                .status(status)
                .message(message)
                .data(null)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.ok(response);
    }
}
