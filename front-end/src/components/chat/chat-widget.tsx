"use client";

import React from "react";
import { Badge, Fab, Tooltip } from "@mui/material";
import { Bot, Sparkles } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatWindow } from "./chat-window";

export function ChatWidget() {
  const chat = useChat();
  const { isOpen, toggleOpen, setIsOpen } = chat;

  return (
    <>
      {!isOpen && (
        <Tooltip title="DevEdu AI Course Advisor" placement="left" arrow>
          <Fab
            aria-label="open chatbot"
            onClick={toggleOpen}
            sx={{
              position: "fixed",
              bottom: { xs: 16, sm: 28 },
              right: { xs: 16, sm: 28 },
              zIndex: 1200,
              width: { xs: 52, sm: 58 },
              height: { xs: 52, sm: 58 },
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              color: "#ffffff",
              boxShadow: "0 10px 30px -5px rgba(37, 99, 235, 0.5)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "scale(1.1) rotate(4deg)",
                boxShadow: "0 14px 36px -4px rgba(124, 58, 237, 0.6)",
                background: "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
              },
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              badgeContent={
                <Sparkles size={14} style={{ color: "#fbbf24", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
              }
            >
              <Bot size={26} />
            </Badge>
          </Fab>
        </Tooltip>
      )}

      <ChatWindow chat={chat} onClose={() => setIsOpen(false)} />
    </>
  );
}
