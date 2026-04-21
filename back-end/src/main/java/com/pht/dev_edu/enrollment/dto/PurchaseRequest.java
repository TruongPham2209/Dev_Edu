package com.pht.dev_edu.enrollment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PurchaseRequest {
    @NotNull(message = "Entity ID is required")
    UUID entityId;

    @NotNull(message = "Entity type is required")
    PurchaseEntityType entityType;

    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod;
}
