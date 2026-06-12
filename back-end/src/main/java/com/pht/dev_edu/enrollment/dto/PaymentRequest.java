package com.pht.dev_edu.enrollment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PaymentRequest {
    @NotNull(message = "Order is required")
    UUID orderId;

    String ipAddress;

    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod;
}
