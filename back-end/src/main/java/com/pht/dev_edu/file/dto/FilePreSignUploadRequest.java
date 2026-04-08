package com.pht.dev_edu.file.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FilePreSignUploadRequest {
    String username;

    @NotBlank(message = "fileName must not be blank")
    String fileName;

    @NotBlank(message = "contentType must not be blank")
    String contentType;

    @Min(1)
    @NotNull(message = "fileSize must not be null")
    Long fileSize;

    boolean isPublic;
}
