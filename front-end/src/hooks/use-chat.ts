"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { useToast } from "@/lib/toast-context";
import {
  useChatConversationsQuery,
  useConversationMessagesQuery,
  useDeleteConversationMutation,
  useSendChatMessageMutation,
} from "@/lib/api/chat";
import type {
  CourseCardResponse,
  HistoryItem,
} from "@/lib/type/chat";

export interface UiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  courses?: CourseCardResponse[];
  createdAt?: string;
}

export function useChat() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatMode, setChatMode] = useState<"default" | "expanded">("default");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const characterCount = inputMessage.length;
  const isMaxCharExceeded = characterCount > 500;

  // React Query: conversations list for authenticated users
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useChatConversationsQuery(isAuthenticated && isOpen);

  // React Query: detailed messages when selecting an existing conversation
  const {
    data: loadedMessages,
    isLoading: isLoadingMessages,
  } = useConversationMessagesQuery(conversationId);

  // Sync loaded messages when switching conversations
  useEffect(() => {
    if (conversationId && loadedMessages) {
      const formatted: UiChatMessage[] = loadedMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        courses: msg.courses || [],
        createdAt: msg.createdAt,
      }));
      setMessages(formatted);
    }
  }, [conversationId, loadedMessages]);

  // Clear or reset state on auth status change
  useEffect(() => {
    if (!isAuthenticated) {
      setConversationId(null);
      setIsSidebarOpen(false);
    }
  }, [isAuthenticated]);

  // Reset chat mode to default when chatbot window is closed
  useEffect(() => {
    if (!isOpen) {
      setChatMode("default");
    }
  }, [isOpen]);

  const sendMutation = useSendChatMessageMutation();
  const deleteMutation = useDeleteConversationMutation();

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setInputMessage("");
    setIsSidebarOpen(false);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return;
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Conversation deleted successfully");
        if (conversationId === id) {
          startNewConversation();
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete conversation";
        toast.error(errorMessage);
      }
    },
    [
      isAuthenticated,
      deleteMutation,
      conversationId,
      startNewConversation,
      toast,
    ],
  );

  const selectConversation = useCallback((id: string) => {
    setConversationId(id);
    setIsSidebarOpen(false);
  }, []);

  const historyItems: HistoryItem[] = useMemo(() => {
    return messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const textToSend = (overrideText ?? inputMessage).trim();
      if (!textToSend || textToSend.length > 500 || sendMutation.isPending) {
        return;
      }

      const userMsgId = `user-${Date.now()}`;
      const userMessage: UiChatMessage = {
        id: userMsgId,
        role: "user",
        content: textToSend,
        createdAt: new Date().toISOString(),
      };

      // Optimistically add user message
      setMessages((prev) => [...prev, userMessage]);
      if (!overrideText) {
        setInputMessage("");
      }

      try {
        const response = await sendMutation.mutateAsync({
          conversationId: isAuthenticated ? conversationId : null,
          message: textToSend,
          history: isAuthenticated ? undefined : historyItems,
        });

        if (!response) {
          throw new Error("No response payload received from chatbot service");
        }

        if (response.conversationId && !conversationId) {
          setConversationId(response.conversationId);
        }

        const replyContent =
          response.reply?.content ||
          "Sorry, I could not generate a reply. Please try again.";

        const assistantMessage: UiChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: replyContent,
          courses: response.courses || [],
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        toast.error(errorMessage);
        // Remove optimistic user message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMsgId));
      }
    },
    [
      inputMessage,
      sendMutation,
      isAuthenticated,
      conversationId,
      historyItems,
      toast,
    ],
  );

  const toggleChatMode = useCallback(() => {
    setChatMode((prev) => (prev === "default" ? "expanded" : "default"));
  }, []);

  return {
    isOpen,
    setIsOpen,
    toggleOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    chatMode,
    setChatMode,
    toggleChatMode,
    conversationId,
    messages,
    inputMessage,
    setInputMessage,
    characterCount,
    isMaxCharExceeded,
    sendMessage,
    startNewConversation,
    selectConversation,
    deleteConversation,
    isDeletingConversation: deleteMutation.isPending,
    isLoading: sendMutation.isPending || isLoadingMessages,
    conversations,
    isLoadingConversations,
    refetchConversations,
    isAuthenticated,
  };
}
