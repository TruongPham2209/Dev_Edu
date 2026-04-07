package com.pht.dev_edu.user.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.dto.RoleEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "role")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    RoleEnum name;

    @Column
    String description;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
    }
}
