package com.pht.dev_edu.chat.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "chat_messages")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "conversation_id", nullable = false)
    UUID conversationId;

    @Column(nullable = false, length = 20)
    String role; // 'user' | 'assistant'

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "referenced_course_ids", columnDefinition = "jsonb")
    List<UUID> referencedCourseIds;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

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
