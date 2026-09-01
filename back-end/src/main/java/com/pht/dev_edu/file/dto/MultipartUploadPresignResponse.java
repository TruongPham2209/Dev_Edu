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
public class MultipartUploadPresignResponse {
    String sessionId;
    List<PresignedPartDto> parts;
}
