package com.pht.dev_edu.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class FileUploadResponse {
    String originalFileName;
    String originalFileContentType;
    String uploadUrl;
    String objectKey;
    String publicUrl; // Optional: URL to access the uploaded file
    String downloadUrl;
}
