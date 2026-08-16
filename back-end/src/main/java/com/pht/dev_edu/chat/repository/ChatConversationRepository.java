package com.pht.dev_edu.chat.repository;

import com.pht.dev_edu.chat.entity.ChatConversationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatConversationRepository extends JpaRepository<ChatConversationEntity, UUID> {
    List<ChatConversationEntity> findByUsernameOrderByUpdatedAtDesc(String username);

    Optional<ChatConversationEntity> findByIdAndUsername(UUID id, String username);
}
