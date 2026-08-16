"use client";

import React, { useEffect, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import {
  Bot,
  History,
  Maximize2,
  Minimize2,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import type { useChat } from "@/hooks/use-chat";
import { ChatMessageItem } from "./chat-message-item";
import { QuickPrompts } from "./quick-prompts";
import { ChatSidebar } from "./chat-sidebar";

export interface ChatWindowProps {
  chat: ReturnType<typeof useChat>;
  onClose: () => void;
}

export function ChatWindow({ chat, onClose }: ChatWindowProps) {
  const {
    isOpen,
    isSidebarOpen,
    toggleSidebar,
    setIsSidebarOpen,
    chatMode,
    toggleChatMode,
    messages,
    inputMessage,
    setInputMessage,
    characterCount,
    isMaxCharExceeded,
    sendMessage,
    startNewConversation,
    selectConversation,
    isLoading,
    conversations,
    isLoadingConversations,
    isAuthenticated,
  } = chat;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isExpanded = chatMode === "expanded";

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, chatMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !isMaxCharExceeded && !isLoading) {
        sendMessage();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay when expanded with smooth fade transition */}
      <Box
        onClick={onClose}
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(8px)",
          zIndex: 1299,
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? "auto" : "none",
          transition:
            "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.4s ease",
        }}
      />

      <Paper
        elevation={16}
        sx={{
          position: "fixed",
          zIndex: 1300,
          overflow: "hidden",
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.divider, 0.8),
          bgcolor: "background.paper",
          boxShadow: isExpanded
            ? "0 30px 70px -15px rgba(0, 0, 0, 0.45)"
            : "0 20px 50px -10px rgba(0, 0, 0, 0.25)",
          transition:
            "top 0.45s cubic-bezier(0.16, 1, 0.3, 1), left 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), width 0.45s cubic-bezier(0.16, 1, 0.3, 1), height 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.35s ease, box-shadow 0.45s ease",
          willChange: "top, left, transform, width, height",
          ...(isExpanded
            ? {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "calc(100vw - 24px)", sm: 840, md: 900 },
                height: { xs: "calc(100vh - 36px)", sm: 660, md: 700 },
                maxHeight: "85vh",
                maxWidth: "calc(100vw - 32px)",
                borderRadius: 2,
              }
            : {
                top: {
                  xs: "calc(100vh - 90px - 12px)",
                  sm: "calc(100vh - 620px - 24px)",
                },
                left: {
                  xs: "12px",
                  sm:
                    isSidebarOpen && isAuthenticated
                      ? "calc(100vw - 660px - 24px)"
                      : "calc(100vw - 420px - 24px)",
                },
                transform: "translate(0, 0)",
                width: {
                  xs: "calc(100vw - 24px)",
                  sm: isSidebarOpen && isAuthenticated ? 660 : 420,
                },
                height: { xs: "calc(100vh - 90px)", sm: 620 },
                borderRadius: 2,
              }),
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Premium Header */}
        <Box
          sx={{
            p: isExpanded ? 2 : 1.5,
            px: 2,
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
            color: "#ffffff",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}
          >
            <Stack
              direction="row"
              spacing={1.25}
              sx={{ alignItems: "center", minWidth: 0, flexShrink: 1 }}
            >
              {isAuthenticated && (
                <Tooltip title="Toggle Chat History" placement="top">
                  <IconButton
                    size="small"
                    onClick={toggleSidebar}
                    sx={{
                      flexShrink: 0,
                      color: isSidebarOpen
                        ? "#38bdf8"
                        : "rgba(255, 255, 255, 0.8)",
                      bgcolor: isSidebarOpen
                        ? "rgba(56, 189, 248, 0.15)"
                        : "rgba(255, 255, 255, 0.08)",
                      transition: "all 0.25s ease",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.18)" },
                    }}
                  >
                    <History size={17} />
                  </IconButton>
                </Tooltip>
              )}

              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Avatar
                  sx={{
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                    color: "#ffffff",
                    width: 36,
                    height: 36,
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                  }}
                >
                  <Bot size={20} />
                </Avatar>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    bgcolor: "#10b981",
                    border: "2px solid #0f172a",
                  }}
                />
              </Box>

              <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "0.875rem" }}
                >
                  DevEdu AI Advisor
                </Typography>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ color: "#94a3b8", fontSize: "0.7rem", display: "block" }}
                >
                  {isExpanded
                    ? "Expanded Workspace • AI Course Advisor"
                    : "Online • Smart Assistant"}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center", flexShrink: 0 }}
            >
              <Tooltip title="Start New Chat" placement="top">
                {isExpanded ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Plus size={14} />}
                    onClick={startNewConversation}
                    sx={{
                      color: "#ffffff",
                      borderColor: "rgba(255, 255, 255, 0.25)",
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                      borderRadius: 1.5,
                      px: 1.25,
                      py: 0.4,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "none",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.18)",
                        borderColor: "rgba(255, 255, 255, 0.4)",
                      },
                    }}
                  >
                    New Chat
                  </Button>
                ) : (
                  <IconButton
                    size="small"
                    onClick={startNewConversation}
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                      transition: "all 0.25s ease",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.18)" },
                    }}
                    aria-label="Start New Chat"
                  >
                    <Plus size={17} />
                  </IconButton>
                )}
              </Tooltip>

              <Tooltip
                title={isExpanded ? "Standard View" : "Expanded View"}
                placement="top"
              >
                <IconButton
                  size="small"
                  onClick={toggleChatMode}
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    transition: "all 0.25s ease",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.12)" },
                  }}
                  aria-label={isExpanded ? "Standard View" : "Expanded View"}
                >
                  {isExpanded ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </IconButton>
              </Tooltip>

              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  transition: "all 0.25s ease",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.12)" },
                }}
                aria-label="Close chat window"
              >
                <X size={18} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* Main Content Area: Side-by-side History Panel + Chat Stream */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Integrated History Side Panel */}
          {isAuthenticated && (
            <ChatSidebar
              open={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              conversations={conversations}
              activeConversationId={chat.conversationId}
              onSelectConversation={selectConversation}
              onStartNewChat={startNewConversation}
              isLoading={isLoadingConversations}
            />
          )}

          {/* Main Chat Stream */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Chat Body */}
            <Box
              sx={{
                flexGrow: 1,
                p: isExpanded ? 3 : 2,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "#0b1329" : "#f8fafc",
                transition: "padding 0.35s ease",
              }}
            >
              {messages.length === 0 ? (
                <Stack
                  spacing={2}
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    my: "auto",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 58,
                      height: 58,
                      background:
                        "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.12) 100%)",
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.2),
                    }}
                  >
                    <Sparkles size={30} style={{ color: "#7c3aed" }} />
                  </Avatar>

                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 800, fontSize: "1.05rem" }}
                    >
                      Welcome to DevEdu AI Advisor!
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 360,
                        mx: "auto",
                        fontSize: "0.825rem",
                        lineHeight: 1.5,
                      }}
                    >
                      I can analyze your goals, recommend suitable courses, or
                      craft a custom learning roadmap.
                    </Typography>
                  </Box>

                  <QuickPrompts
                    onSelectPrompt={(text) => sendMessage(text)}
                    disabled={isLoading}
                  />
                </Stack>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessageItem key={msg.id} message={msg} />
                  ))}

                  {isLoading && (
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{
                        alignItems: "flex-start",
                        width: "100%",
                        my: 1.5,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          background:
                            "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                          color: "#ffffff",
                          boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
                          border: "1.5px solid rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        <Bot size={19} />
                      </Avatar>

                      <Box
                        sx={{
                          px: 2.25,
                          py: 1.5,
                          borderRadius: "12px 12px 12px 3px",
                          background: (theme) =>
                            theme.palette.mode === "dark"
                              ? alpha(theme.palette.background.paper, 0.9)
                              : "#ffffff",
                          backdropFilter: "blur(12px)",
                          border: "1px solid",
                          borderColor: (theme) =>
                            alpha(theme.palette.divider, 0.8),
                          boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            background:
                              "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontSize: "0.825rem",
                          }}
                        >
                          AI is analyzing
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{ alignItems: "center", pt: 0.25 }}
                        >
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              bgcolor: "#2563eb",
                              animation: "pulseDots 1.4s infinite ease-in-out",
                              animationDelay: "0s",
                              "@keyframes pulseDots": {
                                "0%, 80%, 100%": {
                                  transform: "scale(0.6)",
                                  opacity: 0.3,
                                },
                                "40%": {
                                  transform: "scale(1.3)",
                                  opacity: 1,
                                },
                              },
                            }}
                          />
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              bgcolor: "#6366f1",
                              animation: "pulseDots 1.4s infinite ease-in-out",
                              animationDelay: "0.2s",
                            }}
                          />
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              bgcolor: "#7c3aed",
                              animation: "pulseDots 1.4s infinite ease-in-out",
                              animationDelay: "0.4s",
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Footer Input Area */}
            <Box
              sx={{
                p: isExpanded ? 2 : 1.5,
                bgcolor: "background.paper",
                borderTop: "1px solid",
                borderColor: (theme) => alpha(theme.palette.divider, 0.8),
                transition: "padding 0.35s ease",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.default, 0.8)
                      : alpha(theme.palette.background.default, 0.6),
                  border: "1px solid",
                  borderColor: (theme) =>
                    isMaxCharExceeded
                      ? theme.palette.error.main
                      : alpha(theme.palette.divider, 0.9),
                  p: 0.75,
                  pl: 2,
                  transition: "all 0.2s ease",
                  "&:focus-within": {
                    borderColor: "primary.main",
                    boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
                    bgcolor: "background.paper",
                  },
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={1}
                  maxRows={isExpanded ? 5 : 3}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask AI about courses or roadmaps..."
                  variant="standard"
                  slotProps={{
                    input: {
                      disableUnderline: true,
                      sx: {
                        py: 0.5,
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                      },
                    },
                  }}
                />

                <IconButton
                  disabled={
                    !inputMessage.trim() || isMaxCharExceeded || isLoading
                  }
                  onClick={() => sendMessage()}
                  aria-label="Send message"
                  size="small"
                  sx={{
                    ml: 1,
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                    color: "#ffffff",
                    width: 34,
                    height: 34,
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
                      transform: "scale(1.05)",
                    },
                    "&.Mui-disabled": {
                      background: (theme) =>
                        alpha(
                          theme.palette.action.disabledBackground,
                          0.6,
                        ),
                      color: "text.disabled",
                      boxShadow: "none",
                    },
                  }}
                >
                  <Send size={15} />
                </IconButton>
              </Box>

              {/* Character Count OUTSIDE the Input Container */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 0.5,
                  px: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.68rem",
                    color: isMaxCharExceeded ? "error.main" : "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  {characterCount}/500
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </>
  );
}
