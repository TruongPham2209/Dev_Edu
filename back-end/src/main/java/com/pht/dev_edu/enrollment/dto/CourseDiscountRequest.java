package com.pht.dev_edu.enrollment.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CourseDiscountRequest {
    // Null if applying to all courses, otherwise must be a valid course ID
    UUID courseId;

    @NotBlank(message = "Description is required")
    String description;

    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    @DecimalMax(value = "100.00", message = "Discount value cannot exceed 100")
    @NotNull(message = "Discount value is required")
    BigDecimal discountPercentage;

    @NotNull(message = "Valid from date is required")
    @FutureOrPresent(message = "Valid from date cannot be in the past")
    LocalDate validFrom;

    @NotNull(message = "Valid to date is required")
    @FutureOrPresent(message = "Valid to date cannot be in the past")
    LocalDate validTo;
}