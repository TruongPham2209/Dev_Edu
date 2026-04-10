package com.pht.dev_edu.lecture.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ProgressSegmentRequest {
    @NotNull(message = "Lecture ID is required")
    UUID lectureId;

    @Min(value = 0, message = "Segment start must be non-negative")
    @NotNull(message = "Segment is required")
    Integer segmentStart;

    @Min(value = 0, message = "Segment end must be non-negative")
    @NotNull(message = "Segment is required")
    Integer segmentEnd;
}
