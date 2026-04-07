package com.pht.dev_edu.user.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import net.minidev.json.annotate.JsonIgnore;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "user")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UserEntity implements UserDetails {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(nullable = false, unique = true)
    String username;

    @Column(name = "full_name", nullable = false)
    String fullName;

    @Column(name = "avatar_url")
    String avatarUrl;

    @Column(nullable = false)
    String password;

    @Column(nullable = false, unique = true)
    String email;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    Set<RoleEntity> roles;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @NotNull
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        var roles = this.roles.stream().map(r -> r.getName().name()).toList();
        if (roles.isEmpty()) {
            return List.of(new SimpleGrantedAuthority("USER"));
        }

        return roles.stream().map(SimpleGrantedAuthority::new).toList();
    }
}
