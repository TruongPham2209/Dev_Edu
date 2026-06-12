package com.pht.dev_edu.enrollment.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.enrollment.dto.PurchaseEntityType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "order_item")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItemEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "order_id", nullable = false)
    UUID orderId;

    @Column(name = "item_id", nullable = false)
    UUID itemId;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    PurchaseEntityType itemType;

    @Column(name = "original_price", nullable = false)
    BigDecimal originalPrice;

    @Column(name = "discounted_price", nullable = false)
    BigDecimal discountedPrice;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
    }
}
