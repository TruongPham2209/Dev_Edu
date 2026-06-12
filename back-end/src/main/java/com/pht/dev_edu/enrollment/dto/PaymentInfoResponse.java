package com.pht.dev_edu.enrollment.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PaymentInfoResponse {
    UUID paymentId;
    UUID orderId;
    PurchaseEntityType entityType;
    String paymentUrl;
    BigDecimal totalAmount;
}
