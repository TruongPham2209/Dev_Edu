package com.pht.dev_edu.common.util;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.exception.AbstractException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Slf4j
public class ApiUtil {
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
