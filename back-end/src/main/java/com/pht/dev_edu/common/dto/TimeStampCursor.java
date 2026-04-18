package com.pht.dev_edu.common.dto;

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
public class TimeStampCursor {
    LocalDateTime timeStamp;
    UUID id;

    public static TimeStampCursor getDefaultCursor(boolean isDescending) {
        if (!isDescending) {
            return TimeStampCursor.builder()
                    .timeStamp(LocalDateTime.MIN)
                    .id(new UUID(Long.MIN_VALUE, Long.MIN_VALUE))
                    .build();
        }

        return TimeStampCursor.builder()
                .timeStamp(LocalDateTime.MAX)
                .id(new UUID(Long.MAX_VALUE, Long.MAX_VALUE))
                .build();
    }
}
