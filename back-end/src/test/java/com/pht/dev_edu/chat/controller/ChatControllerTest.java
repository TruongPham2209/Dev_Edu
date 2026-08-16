package com.pht.dev_edu.chat.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.pht.dev_edu.chat.dto.ChatConversationSummaryResponse;
import com.pht.dev_edu.chat.dto.ChatMessageDetailResponse;
import com.pht.dev_edu.chat.dto.ChatMessageRequest;
import com.pht.dev_edu.chat.dto.ChatMessageResponse;
import com.pht.dev_edu.chat.dto.ReplyDto;
import com.pht.dev_edu.chat.service.ChatService;
import com.pht.dev_edu.common.dto.ApiResponse;

/*
 * <analysis>
 * ChatController
 * - sendMessage(ChatMessageRequest request)
 *   - branches:
 *       delegates to chatService.processChatMessage(request) and returns ApiUtils.buildSuccessResponse
 *   - paths:
 *       [P1: successful processing returns HTTP 200 with ChatMessageResponse payload]
 *   - planned tests:
 *       [shouldSendMessageSuccessfully -> P1]
 *
 * - getUserConversations()
 *   - branches:
 *       delegates to chatService.getUserConversations() and returns ApiUtils.buildSuccessResponse
 *   - paths:
 *       [P1: successful retrieval returns HTTP 200 with conversation summaries]
 *   - planned tests:
 *       [shouldGetUserConversationsSuccessfully -> P1]
 *
 * - getConversationMessages(UUID id)
 *   - branches:
 *       delegates to chatService.getConversationMessages(id) and returns ApiUtils.buildSuccessResponse
 *   - paths:
 *       [P1: successful retrieval returns HTTP 200 with message list]
 *   - planned tests:
 *       [shouldGetConversationMessagesSuccessfully -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for ChatController
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify REST controller endpoints for sending chat messages, retrieving conversation
 * list, and fetching detailed conversation messages.
 *
 * Test Scope
 * ----------
 * - sendMessage()
 * - getUserConversations()
 * - getConversationMessages()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Delegation of POST /api/chat/messages to ChatService
 * ✓ Delegation of GET /api/chat/conversations to ChatService
 * ✓ Delegation of GET /api/chat/conversations/{id}/messages to ChatService
 * ✓ Wrapping domain responses in standard HTTP 200 ApiResponse
 *
 * Mocked Dependencies
 * -------------------
 * - ChatService
 */
@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private ChatService chatService;

    @InjectMocks
    private ChatController chatController;

    private static final UUID CONVERSATION_ID = UUID.randomUUID();

    @Test
    @DisplayName("sendMessage - should delegate to chat service and return success response")
    void shouldSendMessageSuccessfully() {
        // Arrange
        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Tư vấn chọn khóa học Web")
                .build();

        ChatMessageResponse serviceResponse = ChatMessageResponse.builder()
                .conversationId(CONVERSATION_ID)
                .reply(ReplyDto.builder().role("assistant").content("Dạ em tư vấn ạ").build())
                .build();

        when(chatService.processChatMessage(any(ChatMessageRequest.class))).thenReturn(serviceResponse);

        // Act
        ResponseEntity<ApiResponse> response = chatController.sendMessage(request);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isEqualTo(serviceResponse);
        verify(chatService).processChatMessage(request);
    }

    @Test
    @DisplayName("getUserConversations - should delegate to chat service and return conversation list")
    void shouldGetUserConversationsSuccessfully() {
        // Arrange
        ChatConversationSummaryResponse summary = ChatConversationSummaryResponse.builder()
                .id(CONVERSATION_ID)
                .lastMessagePreview("Chào bạn")
                .build();

        when(chatService.getUserConversations()).thenReturn(List.of(summary));

        // Act
        ResponseEntity<ApiResponse> response = chatController.getUserConversations();

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isEqualTo(List.of(summary));
        verify(chatService).getUserConversations();
    }

    @Test
    @DisplayName("getConversationMessages - should delegate to chat service and return message list")
    void shouldGetConversationMessagesSuccessfully() {
        // Arrange
        ChatMessageDetailResponse messageDetail = ChatMessageDetailResponse.builder()
                .id(UUID.randomUUID())
                .role("assistant")
                .content("Chi tiết tin nhắn")
                .build();

        when(chatService.getConversationMessages(CONVERSATION_ID)).thenReturn(List.of(messageDetail));

        // Act
        ResponseEntity<ApiResponse> response = chatController.getConversationMessages(CONVERSATION_ID);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isEqualTo(List.of(messageDetail));
        verify(chatService).getConversationMessages(CONVERSATION_ID);
    }
}
