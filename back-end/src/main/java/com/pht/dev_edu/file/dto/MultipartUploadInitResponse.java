package com.pht.dev_edu.file.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultipartUploadInitResponse {
    String sessionId;
    Long chunkSize;
    Integer totalParts;
    Integer windowSize;
    Integer concurrency;
    String objectKey;
    String publicUrl;
}
