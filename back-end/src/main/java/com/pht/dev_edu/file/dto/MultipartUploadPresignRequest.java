package com.pht.dev_edu.file.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultipartUploadPresignRequest {
    @NotNull(message = "fromPart must not be null")
    @Min(value = 1, message = "fromPart must be >= 1")
    Integer fromPart;

    /**
     * Optional custom part count to presign (capped by server-configured windowSize).
     */
    Integer partCount;
}
