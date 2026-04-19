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
@Table(name = "log_request")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LogRequestEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(nullable = false)
    String username;

    @Column(nullable = false)
    String method;

    @Column(nullable = false, columnDefinition = "TEXT")
    String uri;

    @Column(name = "request_body", columnDefinition = "TEXT")
    String requestBody;

    @Column(name = "response_body", columnDefinition = "TEXT")
    String responseBody;

    @Column(nullable = false, updatable = false)
    LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
    }
}
