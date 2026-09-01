package com.pht.dev_edu.file.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultipartUploadInitRequest {
    String username;

    @NotBlank(message = "fileName must not be blank")
    String fileName;

    @NotBlank(message = "contentType must not be blank")
    String contentType;

    @NotNull(message = "fileSize must not be null")
    @Min(value = 1, message = "fileSize must be greater than 0")
    Long fileSize;

    Boolean isPublic;
}
