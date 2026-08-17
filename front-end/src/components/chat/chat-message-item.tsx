"use client";

import React from "react";
import { Avatar, Box, Stack, Typography, alpha } from "@mui/material";
import { Bot, User } from "lucide-react";
import type { UiChatMessage } from "@/hooks/use-chat";
import { CourseCardItem } from "./course-card-item";
import { useAuth } from "@/lib/use-auth";
import { formatServerDate } from "@/lib/util/date-utils";

export interface ChatMessageItemProps {
  message: UiChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const { isAuthenticated, user } = useAuth();

  const userInitials = user?.fullName
    ? user.fullName
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : null;

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 1.5 }}
      sx={{
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-start",
        width: "100%",
        my: 1.5,
      }}
    >
      {/* AI Avatar */}
      {!isUser && (
        <Avatar
          sx={{
            width: { xs: 30, sm: 34 },
            height: { xs: 30, sm: 34 },
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
            border: "1.5px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <Bot size={17} />
        </Avatar>
      )}

      {/* Message Body & Course Cards */}
      <Stack
        direction="column"
        sx={{
          alignItems: isUser ? "flex-end" : "flex-start",
          maxWidth: { xs: "90%", sm: "84%" },
        }}
      >
        <Box
          sx={{
            px: { xs: 1.75, sm: 2.25 },
            py: { xs: 1.25, sm: 1.75 },
            borderRadius: isUser ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
            background: isUser
              ? "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)"
              : (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.9)
                    : "#ffffff",
            backdropFilter: "blur(12px)",
            color: isUser ? "#ffffff" : "text.primary",
            border: isUser
              ? "none"
              : (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            boxShadow: isUser
              ? "0 6px 20px -4px rgba(37, 99, 235, 0.35)"
              : "0 4px 16px -2px rgba(15, 23, 42, 0.05)",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
            lineHeight: 1.55,
            fontWeight: isUser ? 500 : 400,
          }}
        >
          {message.content}
        </Box>

        {/* Recommended Courses List */}
        {message.courses && message.courses.length > 0 && (
          <Stack spacing={1.25} sx={{ mt: 1.5, width: "100%" }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                px: 0.5,
                fontSize: "0.725rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Recommended Courses ({message.courses.length})
            </Typography>

            {message.courses.map((course) => (
              <CourseCardItem key={course.courseId} course={course} />
            ))}
          </Stack>
        )}

        {/* Timestamp */}
        {message.createdAt && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.75, px: 0.75, fontSize: "0.68rem", opacity: 0.75 }}
          >
            {formatServerDate(message.createdAt, "datetime")}
          </Typography>
        )}
      </Stack>

      {/* User Avatar */}
      {isUser && (
        <Avatar
          src={isAuthenticated && user?.avatarUrl ? user.avatarUrl : undefined}
          sx={{
            width: { xs: 30, sm: 34 },
            height: { xs: 30, sm: 34 },
            fontSize: "0.775rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.25)",
            border: "1.5px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          {isAuthenticated && userInitials ? (
            userInitials
          ) : (
            <User size={18} />
          )}
        </Avatar>
      )}
    </Stack>
  );
}
