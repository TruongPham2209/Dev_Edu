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
@Table(name = "lecture_material")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LectureMaterialEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "lecture_id", nullable = false)
    UUID lectureId;

    @Column(nullable = false)
    String title;

    @Column(name = "file_object_key", nullable = false)
    String fileObjectKey;

    @Column(name = "file_type", nullable = false, length = 50)
    String fileType;

    @Column(name = "file_original_name", nullable = false)
    String fileOriginalName;

    @Column(name = "uploaded_at")
    LocalDateTime uploadedAt;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

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
