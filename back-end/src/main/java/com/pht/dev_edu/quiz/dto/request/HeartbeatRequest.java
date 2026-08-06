package com.pht.dev_edu.quiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HeartbeatRequest {
    @NotBlank(message = "sessionToken is required")
    String sessionToken;
}
