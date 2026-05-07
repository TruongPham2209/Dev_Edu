package com.pht.dev_edu.enrollment.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.enrollment.dto.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "\"order\"")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "total_amount", nullable = false)
    BigDecimal totalAmount;

    @Column(nullable = false)
    String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
