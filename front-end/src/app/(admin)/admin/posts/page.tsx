"use client";

import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Collapse,
  Container,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import {
  usePostVersionsInfiniteQuery,
  useUpdatePostVersionMutation,
} from "@/lib/api/forum";
import type { PostResponse, PostStatus } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";

// --- Expandable Content Component ---
const ExpandableContent = ({ content }: { content: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (contentRef.current.scrollHeight > 160) {
        setIsOverflowing(true);
      }
    }
  }, [content]);

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        ref={contentRef}
        sx={{
          maxHeight: expanded ? "none" : 160,
          overflow: "hidden",
          position: "relative",
          transition: "max-height 0.3s ease-in-out",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: expanded
              ? "none"
              : (theme) =>
                  `linear-gradient(transparent, ${theme.palette.background.paper})`,
            pointerEvents: "none",
            display: isOverflowing && !expanded ? "block" : "none",
          },
        }}
      >
        <Box
          className="html-content"
          dangerouslySetInnerHTML={{ __html: content }}
          sx={{
            typography: "body1",
            color: "text.primary",
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 2,
              my: 2,
            },
            "& p": { mt: 0, mb: 2, lineHeight: 1.6 },
            "& ul, & ol": { mt: 0, mb: 2, pl: 3 },
            "& li": { mb: 0.5 },
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              mt: 3,
              mb: 1.5,
              fontWeight: 600,
            },
            "& *:last-child": { mb: 0 },
          }}
        />
      </Box>
      {isOverflowing && (
        <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              py: 0.5,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
              "&:hover": {
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.08)",
              },
            }}
            color="inherit"
            endIcon={
              expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            }
          >
            {expanded ? "Show less" : "Read more"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

// --- Moderation Card Component ---
function ModerationCard({
  post,
  onProcessed,
  isRemoving,
}: {
  post: PostResponse;
  onProcessed: (idsToRemove: string[]) => void;
  isRemoving: boolean;
}) {
  const { mutate: updateVersion, isPending } = useUpdatePostVersionMutation();
  const { handleError, showSuccess } = useApiWithToast();

  const handleAction = (status: PostStatus) => {
    updateVersion(
      { postVersionId: post.id, postStatus: status },
      {
        onSuccess: (data) => {
          showSuccess(`Post ${status.toLowerCase()} successfully`);
          const idsToRemove = [
            post.id,
            data.currentVersionId,
            ...(data.affectedVersionIds || []),
          ];
          onProcessed(idsToRemove);
        },
        onError: (error) => handleError(error),
      },
    );
  };

  return (
    <Collapse in={!isRemoving} timeout={400} unmountOnExit>
      <Box
        sx={{
          pb: 3,
          transition: "all 0.4s ease-out",
          opacity: isRemoving ? 0 : 1,
          transform: isRemoving ? "translateY(-20px)" : "none",
        }}
      >
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            transition:
              "box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            {/* Author & Status Row */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Avatar
                src={post.authorAvatarUrl || undefined}
                alt={post.authorFullName}
                sx={{
                  width: 48,
                  height: 48,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {post.authorFullName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    @{post.authorUsername}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    mt: 0.5,
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Clock size={14} />
                  <Typography variant="body2">
                    {formatServerDate(post.createdAt, "datetime")}
                  </Typography>
                </Stack>
              </Box>
              <Chip
                icon={<ShieldAlert size={14} />}
                label="Pending Review"
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 152, 0, 0.16)"
                      : "#fff4e5",
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#ffb74d" : "#ed6c02",
                  px: 1,
                  border: "1px solid",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 152, 0, 0.3)"
                      : "#ffe0b2",
                  "& .MuiChip-icon": {
                    color: "inherit",
                  },
                }}
              />
            </Stack>

            {/* Post Content */}
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}
              >
                {post.title}
              </Typography>
              {post.shortDescription && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {post.shortDescription}
                </Typography>
              )}
              <ExpandableContent content={post.content} />
            </Box>
          </Box>

          {/* Actions Bar */}
          <Divider />
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "#fcfcfc",
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "flex-end", alignItems: "center" }}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={<XCircle size={18} />}
                onClick={() => handleAction("REJECTED")}
                disabled={isPending || isRemoving}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: { xs: 2, sm: 3 },
                  "&:hover": {
                    bgcolor: "error.50",
                  },
                }}
              >
                Reject Post
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle size={18} />}
                onClick={() => handleAction("APPROVED")}
                disabled={isPending || isRemoving}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: { xs: 3, sm: 4 },
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                }}
              >
                Approve Post
              </Button>
            </Stack>
          </Box>
        </Card>
      </Box>
    </Collapse>
  );
}

// --- Skeleton Component ---
const PostSkeleton = () => (
  <Card
    sx={{
      mb: 3,
      borderRadius: 3,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
    }}
  >
    <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: "center" }}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton width="30%" height={24} sx={{ mb: 0.5 }} />
          <Skeleton width="20%" height={16} />
        </Box>
        <Skeleton
          variant="rounded"
          width={130}
          height={28}
          sx={{ borderRadius: 1 }}
        />
      </Stack>

      <Skeleton width="60%" height={32} sx={{ mb: 1.5 }} />
      <Skeleton width="80%" height={20} sx={{ mb: 0.5 }} />
      <Skeleton width="40%" height={20} sx={{ mb: 3 }} />

      <Skeleton
        variant="rounded"
        width="100%"
        height={100}
        sx={{ borderRadius: 2 }}
      />
    </Box>
    <Divider />
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "#fcfcfc",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "flex-end", alignItems: "center" }}
      >
        <Skeleton
          variant="rounded"
          width={120}
          height={40}
          sx={{ borderRadius: 2 }}
        />
        <Skeleton
          variant="rounded"
          width={130}
          height={40}
          sx={{ borderRadius: 2 }}
        />
      </Stack>
    </Box>
  </Card>
);

// --- Main Page Component ---
export default function AdminPostsPage() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePostVersionsInfiniteQuery("PENDING");

  const queryClient = useQueryClient();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleProcessed = useCallback(
    (idsToRemove: string[]) => {
      // 1. Mark for animation
      setRemovingIds((prev) => {
        const next = new Set(prev);
        idsToRemove.forEach((id) => next.add(id));
        return next;
      });

      // 2. Remove from cache after animation completes
      setTimeout(() => {
        queryClient.setQueryData(
          ["forum", "versions-infinite", "PENDING"],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                contents: page.contents.filter(
                  (p: any) => !idsToRemove.includes(p.id),
                ),
              })),
            };
          },
        );
      }, 400);
    },
    [queryClient],
  );

  const posts = data?.pages.flatMap((page) => page.contents) || [];

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorState
          title="Failed to load pending posts"
          subtitle="There was an error connecting to the server."
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 8, pt: { xs: 2, sm: 4 }, minHeight: "100vh" }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Post Moderation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve or reject forum posts awaiting publication.
          </Typography>
        </Box>

        {isLoading ? (
          <Box>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </Box>
        ) : posts.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "transparent",
            }}
          >
            <EmptyState
              title="No posts to review"
              subtitle="You're all caught up! There are no pending posts at the moment."
            />
          </Paper>
        ) : (
          <Box>
            {posts.map((post) => (
              <ModerationCard
                key={post.id}
                post={post}
                onProcessed={handleProcessed}
                isRemoving={removingIds.has(post.id)}
              />
            ))}

            {/* Infinite Scroll Target */}
            <Box
              ref={observerTarget}
              sx={{ py: 3, display: "flex", justifyContent: "center" }}
            >
              {isFetchingNextPage && <PostSkeleton />}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
