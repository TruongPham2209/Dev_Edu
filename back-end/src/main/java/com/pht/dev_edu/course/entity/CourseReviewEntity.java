package com.pht.dev_edu.course.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "course_review")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseReviewEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(columnDefinition = "TEXT")
    String comment;

    @Column(name = "course_id")
    UUID courseId;

    @Column(nullable = false)
    Integer rating;

    @Column(name = "student_username", nullable = false)
    String studentUsername;

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
