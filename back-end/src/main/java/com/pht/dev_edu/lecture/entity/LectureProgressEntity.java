package com.pht.dev_edu.lecture.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "lecture_progress")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LectureProgressEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "lecture_id", nullable = false)
    UUID lectureId;

    @Column(name = "student", nullable = false)
    String student;

    @Column(name = "completed_at")
    LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}
