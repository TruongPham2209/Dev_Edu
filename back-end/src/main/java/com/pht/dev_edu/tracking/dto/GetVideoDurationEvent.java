package com.pht.dev_edu.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class GetVideoDurationEvent {
    String objectKey;

    UUID entityId;

    VideoType videoType;

    public enum VideoType {
        LECTURE, ASSIGNMENT
    }
}
