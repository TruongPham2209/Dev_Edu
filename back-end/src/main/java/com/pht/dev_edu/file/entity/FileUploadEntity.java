package com.pht.dev_edu.file.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.file.dto.UploadStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "file_upload")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileUploadEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "object_key", nullable = false)
    String objectKey;

    @Column(name = "file_name")
    String fileName;

    @Column(name = "file_size")
    Long fileSize;

    @Column(name = "content_type")
    String contentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    UploadStatus status;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "confirmed_at")
    LocalDateTime confirmedAt;

    @Column(name = "expired_at")
    LocalDateTime expiredAt;

    @Column(name = "checksum")
    String checkSum;

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
