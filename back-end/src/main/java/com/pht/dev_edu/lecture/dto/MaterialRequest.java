package com.pht.dev_edu.lecture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class MaterialRequest {
    @NotNull(message = "Lecture ID is required")
    UUID lectureId;

    @NotBlank(message = "Title is required")
    String title;

    @NotBlank(message = "File object key is required")
    String fileObjectKey;
}
