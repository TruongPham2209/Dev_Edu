package com.pht.dev_edu.enrollment.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.enrollment.dto.PaymentMethod;
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
@Table(name = "payment_history")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentHistoryEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(nullable = false)
    BigDecimal amount;

    @Column(nullable = false)
    String username;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentStatus status;

    @Column(name = "transaction_id", nullable = false, unique = true)
    String transactionId;

    @Column(name = "payment_time")
    LocalDateTime paymentTime;

    @Column(name = "expiration_time")
    LocalDateTime expirationTime;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }

        if (paymentTime == null) {
            paymentTime = LocalDateTime.now();
        }
    }
}
