"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { ChatConversationSummary } from "@/lib/type/chat";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { MessageSquare, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  conversations: ChatConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onStartNewChat: () => void;
  isLoading: boolean;
  onDeleteConversation?: (id: string) => void;
  isDeleting?: boolean;
}

export function ChatSidebar({
  open,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onStartNewChat,
  isLoading,
  onDeleteConversation,
  isDeleting,
}: ChatSidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  return (
    <Box
      sx={{
        position: { xs: "absolute", sm: "relative" },
        top: 0,
        left: 0,
        bottom: 0,
        width: { xs: open ? "100%" : 0, sm: open ? 260 : 0 },
        minWidth: { xs: open ? "100%" : 0, sm: open ? 260 : 0 },
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
        transition:
          "width 0.4s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, visibility 0.4s ease",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
        borderRight: open ? "1px solid" : "0px solid",
        borderColor: (theme) => alpha(theme.palette.divider, 0.8),
        flexShrink: 0,
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          p: 1.5,
          pb: 1,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          startIcon={<Plus size={15} />}
          onClick={() => {
            onStartNewChat();
            onClose();
          }}
          sx={{
            borderRadius: 2,
            py: 0.75,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            boxShadow: "0 3px 10px rgba(37, 99, 235, 0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
            },
          }}
        >
          New Conversation
        </Button>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            display: { xs: "inline-flex", sm: "none" },
            color: "text.secondary",
            p: 0.75,
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      <Divider sx={{ my: 0.5, flexShrink: 0 }} />

      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1.25, pb: 1.5 }}>
        {isLoading ? (
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2 }} />
          </Stack>
        ) : conversations.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              px: 1.5,
              color: "text.secondary",
            }}
          >
            <MessageSquare
              size={32}
              style={{ opacity: 0.35, marginBottom: 8 }}
            />
            <Typography
              variant="body2"
              gutterBottom
              sx={{ fontWeight: 600, fontSize: "0.8rem" }}
            >
              No past chats
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              Start a new conversation with AI Advisor.
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ pt: 0.5 }}>
            {conversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;

              return (
                <ListItemButton
                  key={conv.id}
                  selected={isSelected}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    p: 1,
                    transition: "all 0.2s ease",
                    border: "1px solid",
                    borderColor: isSelected ? "primary.main" : "transparent",
                    bgcolor: isSelected
                      ? (theme) => alpha(theme.palette.primary.main, 0.08)
                      : "transparent",
                    "&:hover": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.05),
                      "& .delete-conv-btn": {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={conv.lastMessagePreview || "Conversation"}
                    secondary={
                      conv.updatedAt
                        ? formatServerDate(conv.updatedAt, "datetime")
                        : undefined
                    }
                    slotProps={{
                      primary: {
                        noWrap: true,
                        variant: "body2",
                        sx: {
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? "primary.main" : "text.primary",
                          fontSize: "0.8rem",
                        },
                      },
                      secondary: {
                        variant: "caption",
                        sx: { fontSize: "0.68rem" },
                      },
                    }}
                  />
                  {onDeleteConversation && (
                    <IconButton
                      className="delete-conv-btn"
                      size="small"
                      aria-label="Delete conversation"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(conv.id);
                      }}
                      sx={{
                        ml: 0.5,
                        p: 0.5,
                        color: "text.secondary",
                        opacity: { xs: 1, sm: 0.5 },
                        transition: "all 0.2s ease",
                        "&:hover": {
                          color: "error.main",
                          bgcolor: (theme) =>
                            alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  )}
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        isLoading={Boolean(isDeleting)}
        onConfirm={async () => {
          if (deletingId && onDeleteConversation) {
            await onDeleteConversation(deletingId);
          }
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </Box>
  );
}
