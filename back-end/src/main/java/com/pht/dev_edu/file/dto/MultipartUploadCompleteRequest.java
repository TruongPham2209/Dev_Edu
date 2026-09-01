package com.pht.dev_edu.file.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultipartUploadCompleteRequest {
    @NotEmpty(message = "parts list must not be empty")
    @Valid
    List<MultipartUploadPartDto> parts;
}
