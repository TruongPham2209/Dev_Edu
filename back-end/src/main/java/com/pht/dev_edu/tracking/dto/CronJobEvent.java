package com.pht.dev_edu.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CronJobEvent {
    String cronJobName;

    String details;

    @Builder.Default
    LocalDateTime timestamp = LocalDateTime.now();
}
