"use client";

import { PostHistoryModal } from "@/components/dialog/post-history/page";
import { useSavePostMutation, useUnsavePostMutation } from "@/lib/api/forum";
import type { PostResponse } from "@/lib/type/forums";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { useAuth } from "@/lib/use-auth";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import {
  Bookmark,
  BookmarkCheck,
  Eye,
  History,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PostHeaderProps {
  post: PostResponse;
}

export function PostHeader({ post }: PostHeaderProps) {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const { handleError, showSuccess } = useApiWithToast();

  useEffect(() => {
    setIsSaved(post.isSaved);
  }, [post.id, post.isSaved]);

  const { mutateAsync: savePostMutate } = useSavePostMutation();
  const { mutateAsync: unsavePostMutate } = useUnsavePostMutation();

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      handleError(new Error("You need to login to save this post"));
      return;
    }

    setIsSaving(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved); // Optimistic update

    try {
      if (prevSaved) {
        await unsavePostMutate(post.id);
        showSuccess("Unsaved post successfully");
      } else {
        await savePostMutate(post.id);
        showSuccess("Saved post successfully");
      }
    } catch (error) {
      setIsSaved(prevSaved); // Revert on failure
      handleError(error, "Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ mb: { xs: 2.5, sm: 4 } }}>
      <Stack spacing={{ xs: 2, sm: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar
              src={post.authorAvatarUrl || undefined}
              sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, bgcolor: "primary.main" }}
            >
              {post.authorFullName?.[0]?.toUpperCase() ||
                post.authorUsername?.[0]?.toUpperCase() ||
                "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
                {post.authorFullName || post.authorUsername}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2 }}
                sx={{ alignItems: { xs: "flex-start", sm: "center" }, flexWrap: "wrap" }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.775rem", sm: "0.875rem" } }}>
                  {formatServerDate(post.createdAt, "datetime")}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "text.secondary",
                    }}
                  >
                    <Eye size={15} />
                    <Typography variant="caption" sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}>{post.views || 0}</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "text.secondary",
                    }}
                  >
                    <MessageSquare size={15} />
                    <Typography variant="caption" sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}>
                      {post.comments || 0}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="History">
              <IconButton
                onClick={() => setIsHistoryModalOpen(true)}
                size="small"
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  p: { xs: 0.8, sm: 1 },
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <History size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isSaved ? "Unsave" : "Save"}>
              <IconButton
                onClick={handleToggleSave}
                disabled={isSaving}
                size="small"
                sx={(theme) => ({
                  bgcolor: isSaved
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "background.paper",
                  color: isSaved ? "primary.main" : "text.secondary",
                  boxShadow: 1,
                  p: { xs: 0.8, sm: 1 },
                  "&:hover": {
                    bgcolor: isSaved
                      ? alpha(theme.palette.primary.main, 0.2)
                      : "action.hover",
                  },
                  transition: "all 0.2s",
                  transform: isSaving ? "scale(0.9)" : "scale(1)",
                })}
              >
                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.35rem", sm: "1.85rem", md: "2.5rem" },
              lineHeight: 1.25,
              mb: post.thumbUrl ? { xs: 2, sm: 3 } : 0,
              wordBreak: "break-word",
            }}
          >
            {post.title}
          </Typography>
          {post.thumbUrl && (
            <Box
              sx={{
                width: "100%",
                maxHeight: { xs: 240, sm: 360, md: 450 },
                borderRadius: { xs: 1.5, sm: 2 },
                overflow: "hidden",
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
        </Box>
      </Stack>

      {isHistoryModalOpen && (
        <PostHistoryModal
          open={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          postId={post.id}
          mode="normal"
        />
      )}
    </Box>
  );
}
