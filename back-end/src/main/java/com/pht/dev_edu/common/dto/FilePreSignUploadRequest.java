package com.pht.dev_edu.common.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FilePreSignUploadRequest {
    String username;

    @NotBlank(message = "fileName must not be blank")
    String fileName;

    @NotBlank(message = "contentType must not be blank")
    String contentType;

    boolean isPublic;
}
