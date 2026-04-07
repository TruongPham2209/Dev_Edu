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
@Table(name = "lecture")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LectureEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "course_id", nullable = false)
    UUID courseId;

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT")
    String content;

    @Column(name = "video_object_key")
    String videoObjectKey;

    @Column(name = "lecture_order", nullable = false)
    Integer lectureOrder;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @Column(name = "uploaded_at")
    LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }
}
