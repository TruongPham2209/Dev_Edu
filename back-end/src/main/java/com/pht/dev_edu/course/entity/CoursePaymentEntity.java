package com.pht.dev_edu.course.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "course_payment")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CoursePaymentEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "course_id", nullable = false)
    UUID courseId;

    @Column(name = "student_id", nullable = false)
    UUID studentId;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal amount;

    @Column(nullable = false, length = 50)
    String status;

    @Column(name = "payment_method", nullable = false, length = 50)
    String paymentMethod;

    @Column(name = "transaction_id", nullable = false)
    String transactionId;

    @Column(name = "payment_date")
    LocalDateTime paymentDate;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (paymentDate == null) {
            paymentDate = LocalDateTime.now();
        }
    }
}
