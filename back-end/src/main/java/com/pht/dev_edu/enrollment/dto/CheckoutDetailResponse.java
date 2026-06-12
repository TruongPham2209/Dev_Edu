package com.pht.dev_edu.enrollment.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CheckoutDetailResponse {
    UUID orderId;
    BigDecimal totalAmount;
    PurchaseEntityType entityType;
    List<?> items; // TODO: create specific response for course and bundle
}
