package com.pht.dev_edu.enrollment.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.enrollment.dto.PurchaseEntityType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "cart_item")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "item_id", nullable = false)
    UUID itemId;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    PurchaseEntityType itemType;

    @Column(name = "username", nullable = false)
    String username;

    @Column(name = "payment_id", nullable = false)
    UUID paymentId;

    @Column(name = "added_at")
    LocalDateTime addedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (addedAt == null) {
            addedAt = LocalDateTime.now();
        }
    }
}
