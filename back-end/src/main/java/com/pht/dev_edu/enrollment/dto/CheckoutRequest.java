package com.pht.dev_edu.enrollment.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CheckoutRequest {
    @NotEmpty(message = "Entity IDs cannot be empty")
    List<@NotNull(message = "Entity ID cannot be null") UUID> entityIds;

    @NotNull(message = "Entity type is required")
    PurchaseEntityType entityType;
}
