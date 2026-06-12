package com.pht.dev_edu.course.entity;

import com.github.f4b6a3.uuid.UuidCreator;
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
@Table(name = "course_discount")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseDiscountEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "course_id", nullable = false)
    UUID courseId;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "discount_percentage", nullable = false)
    BigDecimal discountPercentage;

    @Column(name = "valid_from", nullable = false)
    LocalDateTime validFrom;

    @Column(name = "valid_to", nullable = false)
    LocalDateTime validTo;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @Column(name = "created_at")
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
