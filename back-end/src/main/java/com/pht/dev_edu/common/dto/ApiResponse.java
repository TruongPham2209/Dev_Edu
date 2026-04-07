package com.pht.dev_edu.common.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ApiResponse {
    boolean success;
    HttpStatus status; // HTTP status code if needed
    String message;
    Object data;
    Long timestamp;
}
