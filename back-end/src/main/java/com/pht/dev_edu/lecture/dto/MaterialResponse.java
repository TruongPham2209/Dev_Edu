package com.pht.dev_edu.lecture.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.lecture.entity.LectureMaterialEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class MaterialResponse {
    UUID id;

    String title;

    String fileObjectKey;

    String fileOriginalName;

    LocalDateTime uploadedAt;
}
