"use client";

import {
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  History,
  Bookmark,
  BookmarkCheck,
  Eye,
  MessageSquare,
} from "lucide-react";
import type { PostResponse } from "@/lib/api/types";
import { useState } from "react";
import { PostHistoryModal } from "./post-history-modal";
import { useAuth } from "@/lib/use-auth";
import { savePost, unsavePost } from "@/lib/api/forum";
import { useApiWithToast } from "@/lib/use-api-with-toast";

interface PostHeaderProps {
  post: PostResponse;
  initialSavedState?: boolean;
}

export function PostHeader({
  post,
  initialSavedState = false,
}: PostHeaderProps) {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSavedState);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const { handleError, showSuccess } = useApiWithToast();

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      handleError(new Error("Bạn cần đăng nhập để lưu bài viết"));
      return;
    }

    setIsSaving(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved); // Optimistic update

    try {
      if (prevSaved) {
        await unsavePost(post.id);
        showSuccess("Đã bỏ lưu bài viết");
      } else {
        await savePost(post.id);
        showSuccess("Đã lưu bài viết");
      }
    } catch (error) {
      setIsSaved(prevSaved); // Revert on failure
      handleError(error, "Không thể thao tác lưu bài viết");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Avatar
              src={post.authorAvatarUrl || undefined}
              sx={{ width: 48, height: 48, bgcolor: "primary.main" }}
            >
              {post.authorFullName?.[0]?.toUpperCase() ||
                post.authorUsername?.[0]?.toUpperCase() ||
                "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {post.authorFullName || post.authorUsername}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Không rõ"}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "text.secondary",
                  }}
                >
                  <Eye size={16} />
                  <Typography variant="caption">{post.views || 0}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "text.secondary",
                  }}
                >
                  <MessageSquare size={16} />
                  <Typography variant="caption">
                    {post.comments || 0}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Lịch sử chỉnh sửa">
              <IconButton
                onClick={() => setIsHistoryModalOpen(true)}
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <History size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isSaved ? "Bỏ lưu" : "Lưu bài viết"}>
              <IconButton
                onClick={handleToggleSave}
                disabled={isSaving}
                sx={{
                  bgcolor: isSaved ? "primary.light" : "background.paper",
                  color: isSaved ? "primary.main" : "inherit",
                  boxShadow: 1,
                  "&:hover": {
                    bgcolor: isSaved ? "primary.light" : "action.hover",
                  },
                  transition: "all 0.2s",
                  transform: isSaving ? "scale(0.9)" : "scale(1)",
                }}
              >
                {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box>
          {post.thumbUrl && (
            <Box
              sx={{
                width: "100%",
                maxHeight: 450,
                borderRadius: 1,
                overflow: "hidden",
                mb: 4,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
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
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.5rem" },
              lineHeight: 1.2,
            }}
          >
            {post.title}
          </Typography>
          {post.shortDescription && (
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 400, mt: 2 }}
            >
              {post.shortDescription}
            </Typography>
          )}
        </Box>
      </Stack>

      {isHistoryModalOpen && (
        <PostHistoryModal
          open={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          postId={post.id}
        />
      )}
    </Box>
  );
}
