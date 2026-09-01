package com.pht.dev_edu.file.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedPartDto {
    Integer partNumber;
    String presignedUrl;
    LocalDateTime expiresAt;
}
