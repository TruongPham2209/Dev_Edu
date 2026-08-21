package com.pht.dev_edu.chat.controller;

import com.pht.dev_edu.chat.dto.ChatMessageRequest;
import com.pht.dev_edu.chat.dto.ChatMessageResponse;
import com.pht.dev_edu.chat.service.ChatService;
import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatController {
    ChatService chatService;

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse> sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        ChatMessageResponse response = chatService.processChatMessage(request);
        return ApiUtils.buildSuccessResponse(response);
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse> getUserConversations() {
        var conversations = chatService.getUserConversations();
        return ApiUtils.buildSuccessResponse(conversations);
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse> getConversationMessages(@PathVariable("id") UUID id) {
        var messages = chatService.getConversationMessages(id);
        return ApiUtils.buildSuccessResponse(messages);
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse> deleteConversation(@PathVariable("id") UUID id) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        chatService.deleteConversation(id, username);
        return ApiUtils.buildSuccessResponse("Conversation deleted successfully");
    }
}
