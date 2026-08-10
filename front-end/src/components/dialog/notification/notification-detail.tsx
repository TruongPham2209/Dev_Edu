"use client";

import { InfoDialog } from "@/components/common/info-dialog";
import type { NotificationResponse } from "@/lib/type/notification";
import { formatServerDate } from "@/lib/util/date-utils";
import { Box, Chip, Divider, Typography } from "@mui/material";
import { Bell, CheckCircle2, Clock, Shield, User, Users } from "lucide-react";

export interface NotificationDetailDialogProps {
  open: boolean;
  notification: NotificationResponse | null;
  onClose: () => void;
}

export function NotificationDetailDialog({
  open,
  notification,
  onClose,
}: NotificationDetailDialogProps) {
  if (!notification) return null;

  const isGroup = notification.category === "GROUP";
  const isRead = Boolean(notification.isRead);

  const isHtml = notification.content
    ? /<[a-z][\s\S]*>/i.test(notification.content)
    : false;

  return (
    <InfoDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      headerIcon={
        isGroup ? (
          <Users size={24} className="text-amber-600" />
        ) : (
          <Bell size={24} className="text-blue-600" />
        )
      }
      title={notification.title || "Notification Detail"}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Status & Category Badges */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={notification.category}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              bgcolor: isGroup ? "#fef3c7" : "#dbeafe",
              color: isGroup ? "#b45309" : "#1e40af",
              borderRadius: 1.5,
            }}
          />
          <Chip
            label={isRead ? "Read" : "Unread"}
            size="small"
            icon={isRead ? <CheckCircle2 size={14} /> : undefined}
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              bgcolor: isRead ? "#dcfce7" : "#fee2e2",
              color: isRead ? "#15803d" : "#b91c1c",
              borderRadius: 1.5,
            }}
          />
          {notification.targetRoles && notification.targetRoles.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Shield size={14} className="text-slate-400" />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                Roles: {notification.targetRoles.join(", ")}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Content Body (RichText / Plain text support) */}
        {isHtml ? (
          <Box
            dangerouslySetInnerHTML={{ __html: notification.content || "" }}
            sx={{
              color: "#334155",
              lineHeight: 1.6,
              bgcolor: "#f8fafc",
              p: 2.5,
              borderRadius: 1,
              border: "1px solid rgba(15, 23, 42, 0.06)",
              "& p": { margin: "0 0 0.5em 0" },
              "& ul, & ol": { pl: 2.5, my: 0.5 },
              "& h1, & h2, & h3": {
                fontSize: "1.1em",
                my: 0.5,
                fontWeight: 700,
              },
              "& blockquote": {
                borderLeft: "3px solid #2563eb",
                pl: 1.5,
                my: 0.5,
                fontStyle: "italic",
              },
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "#334155",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              bgcolor: "#f8fafc",
              p: 2.5,
              borderRadius: 1,
              border: "1px solid rgba(15, 23, 42, 0.06)",
            }}
          >
            {notification.content || "No detailed content provided."}
          </Typography>
        )}

        <Divider />

        {/* Metadata Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            color: "text.secondary",
            fontSize: "0.85rem",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Clock size={15} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Created: {formatServerDate(notification.createdAt, "datetime")}
            </Typography>
          </Box>

          {notification.createdBy && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <User size={15} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Sent by: {notification.createdBy}
              </Typography>
            </Box>
          )}

          {isRead && notification.readAt && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle2 size={15} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Read at: {formatServerDate(notification.readAt, "datetime")}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </InfoDialog>
  );
}
