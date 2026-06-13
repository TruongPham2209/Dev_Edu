"use client";

import { PostStatus } from "@/lib/type/enum";
import type { PostResponse, SavedPostResponse } from "@/lib/type/forums";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {
  AlertCircle,
  BookmarkMinus,
  Clock,
  Edit2,
  History,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type PostedTabProps = {
  tab: "posted";
  post: PostResponse;
  onEdit?: (post: PostResponse) => void;
  onHistory?: (post: PostResponse) => void;
  onRemove?: (post: PostResponse) => void;
};

type SavedTabProps = {
  tab: "saved";
  post: SavedPostResponse;
  onUnsave?: (post: SavedPostResponse) => void;
};

type DefaultTabProps = {
  tab?: undefined;
  post: PostResponse;
};

export type PostCardProps = (
  | PostedTabProps
  | SavedTabProps
  | DefaultTabProps
) & {
  showStatus?: boolean;
};

export function PostCard({ showStatus = true, ...props }: PostCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const getStatusConfig = (status?: PostStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Waiting for approval",
          color: "#f59e0b",
          bgcolor: "#fef3c7",
          icon: <Clock size={12} />,
        };
      case "REJECTED":
        return {
          label: "Rejected",
          color: "#ef4444",
          bgcolor: "#fee2e2",
          icon: <AlertCircle size={12} />,
        };
      case "APPROVED":
        return {
          label: "Approved",
          color: "#10b981",
          bgcolor: "#d1fae5",
          icon: null,
        };
      default:
        return null;
    }
  };

  // Extract variables based on the tab type
  let id: string;
  let navId: string;
  let title: string;
  let content: string;
  let date: string;
  let authorName: string;
  let authorAvatarUrl: string | undefined;
  let thumbUrl: string | null;
  let status: PostStatus | undefined;

  if (props.tab === "saved") {
    id = props.post.id;
    navId = props.post.postId;
    title = props.post.title;
    content = props.post.shortDescription;
    date = props.post.postedDate;
    authorName = props.post.authorFullName;
    authorAvatarUrl = props.post.authorAvatarUrl || undefined;
    thumbUrl = props.post.thumbUrl;
    status = undefined;
  } else {
    id = props.post.id;
    navId = props.post.id;
    title = props.post.title;
    content = props.post.shortDescription || props.post.content;
    date = props.post.createdAt;
    authorName = props.post.authorFullName || "DevEdu Member";
    authorAvatarUrl = props.post.authorAvatarUrl || undefined;
    thumbUrl = props.post.thumbUrl;
    status = props.post.status;
  }

  const statusConfig = getStatusConfig(status);
  const isApproved = status === "APPROVED" || !status;
  const CardComponent = isApproved ? Link : Box;
  const cardProps = isApproved ? { href: `/posts?id=${navId}` } : {};

  return (
    <Card
      component={CardComponent as any}
      {...cardProps}
      sx={{
        display: "block",
        textDecoration: "none",
        borderRadius: 1,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        bgcolor: "#ffffff",
        position: "relative",
        cursor: isApproved ? "pointer" : "default",
        "&:hover": isApproved
          ? {
              transform: "translateY(-3px)",
              boxShadow: "0 12px 24px -8px rgba(0,0,0,0.1)",
              borderColor: "rgba(56, 189, 248, 0.3)",
              "& .post-title": {
                color: "#0284c7",
              },
            }
          : {},
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.5, md: 3 },
          "&:last-child": { pb: { xs: 2.5, md: 3 } },
        }}
      >
        <Stack spacing={2}>
          {/* Author & Meta */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                src={authorAvatarUrl || undefined}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "rgba(56, 189, 248, 0.1)",
                  color: "#0284c7",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {authorName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#1e293b", lineHeight: 1.2 }}
                >
                  {authorName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Clock size={12} /> {formatServerDate(date, "datetime")}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {showStatus && statusConfig && (
                <Chip
                  label={statusConfig.label}
                  size="small"
                  icon={
                    statusConfig.icon ? (
                      <Box sx={{ color: "inherit", display: "flex" }}>
                        {statusConfig.icon}
                      </Box>
                    ) : undefined
                  }
                  sx={{
                    bgcolor: statusConfig.bgcolor,
                    color: statusConfig.color,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 24,
                    border: "none",
                    "& .MuiChip-icon": { color: "inherit", ml: 1 },
                  }}
                />
              )}

              {props.tab && (
                <Box>
                  <IconButton
                    size="small"
                    onClick={handleMenuClick}
                    sx={{ color: "#64748b" }}
                  >
                    <MoreVertical size={18} />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleCloseMenu}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 1,
                          minWidth: 160,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        },
                      },
                    }}
                  >
                    {props.tab === "posted" && [
                      <MenuItem
                        key="edit"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCloseMenu();
                          props.onEdit?.(props.post);
                        }}
                        disabled={!isApproved}
                      >
                        <Edit2 size={16} style={{ marginRight: 8 }} /> Edit
                      </MenuItem>,
                      <MenuItem
                        key="history"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCloseMenu();
                          props.onHistory?.(props.post);
                        }}
                      >
                        <History size={16} style={{ marginRight: 8 }} /> History
                      </MenuItem>,
                      <MenuItem
                        key="remove"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCloseMenu();
                          props.onRemove?.(props.post);
                        }}
                        sx={{ color: "#ef4444" }}
                      >
                        <Trash2 size={16} style={{ marginRight: 8 }} /> Delete
                      </MenuItem>,
                    ]}
                    {props.tab === "saved" && (
                      <MenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCloseMenu();
                          props.onUnsave?.(props.post);
                        }}
                      >
                        <BookmarkMinus size={16} style={{ marginRight: 8 }} />{" "}
                        Unsave
                      </MenuItem>
                    )}
                  </Menu>
                </Box>
              )}
            </Box>
          </Box>

          {/* Title & Content */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, sm: 3 },
              alignItems: "flex-start",
            }}
          >
            {thumbUrl && (
              <Box
                sx={{
                  width: { xs: 90, sm: 170 },
                  height: { xs: 70, sm: 110 },
                  flexShrink: 0,
                  borderRadius: 1,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  component="img"
                  src={thumbUrl}
                  alt={title}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            )}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                className="post-title"
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  mb: 1,
                  transition: "color 0.2s",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.4,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#475569",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  lineHeight: 1.6,
                  fontSize: "0.95rem",
                }}
              >
                {content}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
