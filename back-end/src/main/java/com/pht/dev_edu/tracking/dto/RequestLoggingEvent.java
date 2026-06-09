package com.pht.dev_edu.tracking.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class RequestLoggingEvent {
    String username;

    String method;

    String uri;

    String requestBody;

    String responseBody;

    @Builder.Default
    LocalDateTime timestamp = LocalDateTime.now();
}
