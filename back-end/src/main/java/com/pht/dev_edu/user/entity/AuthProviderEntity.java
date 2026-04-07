package com.pht.dev_edu.user.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.dto.ProviderEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "auth_provider")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthProviderEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "user_id", nullable = false)
    UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ProviderEnum provider;

    @Column(name = "provider_user_id", nullable = false)
    String providerId;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
    }
}
