package com.pht.dev_edu.chat.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatConversationSummaryResponse {
    UUID id;

    String lastMessagePreview;

    LocalDateTime updatedAt;
}
