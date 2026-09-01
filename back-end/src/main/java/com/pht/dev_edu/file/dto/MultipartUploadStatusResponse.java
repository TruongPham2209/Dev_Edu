package com.pht.dev_edu.file.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultipartUploadStatusResponse {
    String sessionId;
    String objectKey;
    UploadStatus status;
    Integer totalParts;
    Long fileSize;
    Long chunkSize;
    List<Integer> uploadedParts;
}
