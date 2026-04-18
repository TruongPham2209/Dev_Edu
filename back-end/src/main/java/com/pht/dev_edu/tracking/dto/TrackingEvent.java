package com.pht.dev_edu.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class TrackingEvent {
    String username;

    UUID aggregateId;

    String action;

    String details;

    @Builder.Default
    LocalDateTime timestamp = LocalDateTime.now();
}
