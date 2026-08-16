package com.pht.dev_edu.chat.service;

import com.pht.dev_edu.chat.dto.ChatConversationSummaryResponse;
import com.pht.dev_edu.chat.dto.ChatMessageDetailResponse;
import com.pht.dev_edu.chat.dto.ChatMessageRequest;
import com.pht.dev_edu.chat.dto.ChatMessageResponse;

import java.util.List;
import java.util.UUID;

public interface ChatService {
    ChatMessageResponse processChatMessage(ChatMessageRequest request);

    List<ChatConversationSummaryResponse> getUserConversations();

    List<ChatMessageDetailResponse> getConversationMessages(UUID conversationId);
}
