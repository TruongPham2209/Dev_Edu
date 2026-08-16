package com.pht.dev_edu.chat.repository;

import com.pht.dev_edu.chat.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, UUID> {
    List<ChatMessageEntity> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);
    Optional<ChatMessageEntity> findFirstByConversationIdOrderByCreatedAtDesc(UUID conversationId);
}
