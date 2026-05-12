package com.pht.dev_edu.lecture.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ProgressResponse {
    UUID lectureId;
    Boolean completed;
}
