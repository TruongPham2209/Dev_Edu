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
@Table(name = "course")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "category_id")
    UUID categoryId;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal price;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

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
