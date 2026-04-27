package com.pht.dev_edu.tracking.entity;

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
@Table(name = "mail_tracking")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MailTrackingEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(nullable = false)
    String recipient;

    @Column(nullable = false)
    String subject;

    @Column(nullable = false)
    String template;

    @Column(nullable = false)
    String status;

    @Column(columnDefinition = "TEXT", name = "error_message")
    String errorMessage;

    @Column(name = "sent_at", nullable = false, updatable = false)
    LocalDateTime sentAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }
}
