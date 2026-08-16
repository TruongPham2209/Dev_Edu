package com.pht.dev_edu.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageRequest {
    UUID conversationId;

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 500, message = "Message must not exceed 500 characters")
    String message;

    List<HistoryItemDto> history;
}
