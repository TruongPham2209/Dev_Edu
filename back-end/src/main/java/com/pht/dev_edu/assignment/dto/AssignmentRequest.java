package com.pht.dev_edu.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AssignmentRequest {
    @NotNull(message = "Lecture is required")
    UUID lectureId;

    @NotBlank(message = "Title is required")
    String title;

    @NotBlank(message = "Description is required")
    String description;
}