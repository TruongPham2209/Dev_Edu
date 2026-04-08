package com.pht.dev_edu.file.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class FileUploadResponse {
    String originalFileName;
    String contentType;
    Long fileSize;
    String uploadUrl;
    String objectKey;
    String publicUrl; // Optional: URL to access the uploaded file
    String downloadUrl;
}
