package com.pht.dev_edu.forum.entity;

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
@Table(name = "saved_post")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SavedPostEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "post_id", nullable = false)
    UUID postId;

    @Column(nullable = false)
    String username;

    @Column(name = "saved_at")
    LocalDateTime savedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (savedAt == null) {
            savedAt = LocalDateTime.now();
        }
    }
}
