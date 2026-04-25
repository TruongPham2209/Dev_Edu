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
public class PurchaseDetailResponse {
    UUID paymentId;
    String paymentUrl;
    BigDecimal totalAmount;
    PurchaseEntityType entityType;
    List<Object> items; // TODO: create specific response for course and bundle
}
