package com.pht.dev_edu.quiz.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GradeEssayRequest {
    @NotNull(message = "Awarded points is required")
    @DecimalMin(value = "0.0", message = "Awarded points cannot be negative")
    BigDecimal awardedPoints;

    String feedback;
}
