package com.pht.dev_edu.file.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultipartUploadSession implements Serializable {
    private static final long serialVersionUID = 1L;

    private String sessionId;
    private String uploadId;
    private String objectKey;
    private String fullObjectKey;
    private String bucketName;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private Long chunkSize;
    private Integer totalParts;
    private String username;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private UploadStatus status;
}
