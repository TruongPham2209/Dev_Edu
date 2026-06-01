package com.pht.dev_edu.enrollment.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.enrollment.entity.OrderEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class OrderDetailResponse {
    UUID id;
    BigDecimal totalAmount;
    PaymentStatus status;
    LocalDateTime createdAt;
    List<CourseItemDetailResponse> items;
}
