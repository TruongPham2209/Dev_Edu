"use client";

import type { PostResponse, PostStatus } from "@/lib/api/types";
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
  Eye,
  History,
  MessageCircle,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function PostCard({
  post,
  tab,
  onEdit,
  onHistory,
  onRemove,
  onUnsave,
}: {
  post: PostResponse;
  tab?: "posted" | "saved";
  onEdit?: (post: PostResponse) => void;
  onHistory?: (post: PostResponse) => void;
  onRemove?: (post: PostResponse) => void;
  onUnsave?: (post: PostResponse) => void;
}) {
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

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const authorName =
    post.authorFullName || post.authorUsername || "Thành viên DevEdu";
  const tags = ["Thảo luận"];
  const comments = post.comments ?? 0;
  const views = post.views ?? 0;

  const getStatusConfig = (status?: PostStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Chờ duyệt",
          color: "#f59e0b",
          bgcolor: "#fef3c7",
          icon: <Clock size={12} />,
        };
      case "REJECTED":
        return {
          label: "Từ chối",
          color: "#ef4444",
          bgcolor: "#fee2e2",
          icon: <AlertCircle size={12} />,
        };
      case "APPROVED":
        return {
          label: "Đã duyệt",
          color: "#10b981",
          bgcolor: "#d1fae5",
          icon: null,
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig(post.status);
  const isApproved = post.status === "APPROVED" || !post.status;
  const CardComponent = isApproved ? Link : Box;
  const cardProps = isApproved ? { href: `/posts?id=${post.id}` } : {};

  return (
    <Card
      component={CardComponent as any}
      {...cardProps}
      sx={{
        display: "block",
        textDecoration: "none",
        borderRadius: 4,
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
                src={post.authorAvatarUrl || undefined}
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
                  <Clock size={12} /> {formattedDate}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {statusConfig && (
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
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: "#f1f5f9",
                    color: "#475569",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    height: 24,
                    display: { xs: "none", sm: "inline-flex" },
                  }}
                />
              ))}

              {tab && (
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
                    {tab === "posted" && [
                      <MenuItem
                        key="edit"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCloseMenu();
                          onEdit?.(post);
                        }}
                        disabled={!isApproved}
                      >
                        <Edit2 size={16} style={{ marginRight: 8 }} /> Chỉnh sửa
                      </MenuItem>,
                      <MenuItem
                        key="history"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCloseMenu();
                          onHistory?.(post);
                        }}
                      >
                        <History size={16} style={{ marginRight: 8 }} /> Lịch sử
                      </MenuItem>,
                      <MenuItem
                        key="remove"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCloseMenu();
                          onRemove?.(post);
                        }}
                        sx={{ color: "#ef4444" }}
                      >
                        <Trash2 size={16} style={{ marginRight: 8 }} /> Xóa
                      </MenuItem>,
                    ]}
                    {tab === "saved" && (
                      <MenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCloseMenu();
                          onUnsave?.(post);
                        }}
                      >
                        <BookmarkMinus size={16} style={{ marginRight: 8 }} />{" "}
                        Bỏ lưu
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
            {post.thumbUrl && (
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
                  src={post.thumbUrl}
                  alt={post.title}
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
                {post.title}
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
                {post.content}
              </Typography>
            </Box>
          </Box>

          {/* Engagement Metrics */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              pt: 1,
              color: "#64748b",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <MessageCircle size={16} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {comments}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Eye size={16} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {views}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
