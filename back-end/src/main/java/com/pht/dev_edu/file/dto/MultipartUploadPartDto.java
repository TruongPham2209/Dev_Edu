package com.pht.dev_edu.file.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultipartUploadPartDto {
    @NotNull(message = "partNumber must not be null")
    @Min(value = 1, message = "partNumber must be >= 1")
    @JsonProperty("partNumber")
    Integer partNumber;

    @JsonProperty("eTag")
    @JsonAlias({"etag", "ETag", "eTag"})
    @NotBlank(message = "eTag must not be blank")
    String eTag;
}
