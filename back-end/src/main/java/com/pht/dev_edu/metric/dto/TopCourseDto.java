package com.pht.dev_edu.metric.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
public class TopCourseDto {
    UUID id;
    String title;
    BigDecimal price;
    String createdBy;
    LocalDateTime createdAt;
    long enrollmentCount;
    double averageRating;
    long reviewCount;
    BigDecimal totalRevenue;
}
