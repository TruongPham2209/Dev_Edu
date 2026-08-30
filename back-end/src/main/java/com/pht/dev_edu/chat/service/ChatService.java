package com.pht.dev_edu.chat.service;

import com.pht.dev_edu.chat.dto.ChatConversationSummaryResponse;
import com.pht.dev_edu.chat.dto.ChatMessageDetailResponse;
import com.pht.dev_edu.chat.dto.ChatMessageRequest;
import com.pht.dev_edu.chat.dto.ChatMessageResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service for handling AI chatbot conversations, course recommendations, and chat history.
 */
public interface ChatService {

    /**
     * Processes a user chat message, invoking OpenAI API with function calling to recommend relevant courses.
     *
     * @param request the {@link ChatMessageRequest} containing conversation ID (optional) and message content.
     * @return the {@link ChatMessageResponse} containing AI response and recommended courses.
     */
    ChatMessageResponse processChatMessage(ChatMessageRequest request);

    /**
     * Retrieves summary of all chat conversations belonging to the current authenticated user.
     *
     * @return a list of {@link ChatConversationSummaryResponse} items.
     */
    List<ChatConversationSummaryResponse> getUserConversations();

    /**
     * Retrieves all messages within a specific chat conversation.
     *
     * @param conversationId the UUID of the chat conversation.
     * @return a list of {@link ChatMessageDetailResponse} items.
     */
    List<ChatMessageDetailResponse> getConversationMessages(UUID conversationId);

    /**
     * Deletes a chat conversation and all associated messages.
     *
     * @param conversationId the UUID of the conversation to delete.
     * @param username       the username of the conversation owner.
     */
    void deleteConversation(UUID conversationId, String username);
}
