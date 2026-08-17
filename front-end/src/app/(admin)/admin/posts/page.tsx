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
import { PostStatus } from "@/lib/type/enum";
import { PostResponse } from "@/lib/type/forums";
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
            overflowX: "auto",
            wordBreak: "break-word",
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
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Author & Status Header */}
            <Stack
              direction="row"
              spacing={{ xs: 1.5, sm: 2 }}
              sx={{
                mb: { xs: 2, sm: 3 },
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <Avatar
                src={post.authorAvatarUrl || undefined}
                alt={post.authorFullName}
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  border: "1px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    fontSize: { xs: "0.95rem", sm: "1.05rem" },
                    wordBreak: "break-word",
                  }}
                >
                  {post.authorFullName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    fontWeight: 500,
                    mt: 0.25,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  @{post.authorUsername}
                </Typography>
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
                  <Clock size={13} />
                  <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                    {formatServerDate(post.createdAt, "datetime")}
                  </Typography>
                </Stack>
              </Box>
              <Chip
                icon={<ShieldAlert size={13} />}
                label="Pending Review"
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  height: 26,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 152, 0, 0.16)"
                      : "#fff4e5",
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#ffb74d" : "#ed6c02",
                  px: 0.5,
                  border: "1px solid",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 152, 0, 0.3)"
                      : "#ffe0b2",
                  flexShrink: 0,
                  alignSelf: "flex-start",
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
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  lineHeight: 1.3,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  wordBreak: "break-word",
                }}
              >
                {post.title}
              </Typography>
              {post.shortDescription && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    wordBreak: "break-word",
                  }}
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
              p: { xs: 1.5, sm: 2.5 },
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "#fcfcfc",
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}
          >
            <Stack
              direction={{ xs: "row", sm: "row" }}
              spacing={{ xs: 1, sm: 2 }}
              sx={{ justifyContent: "flex-end", alignItems: "center" }}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={<XCircle size={18} />}
                onClick={() => handleAction("REJECTED")}
                disabled={isPending || isRemoving}
                sx={{
                  flex: { xs: 1, sm: "none" },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  px: { xs: 1.5, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  whiteSpace: "nowrap",
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
                  flex: { xs: 1, sm: "none" },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  px: { xs: 2, sm: 4 },
                  py: { xs: 0.75, sm: 1 },
                  whiteSpace: "nowrap",
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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack
        direction="row"
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ mb: 3, alignItems: "center" }}
      >
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton width="40%" height={22} sx={{ mb: 0.5 }} />
          <Skeleton width="25%" height={14} />
        </Box>
        <Skeleton
          variant="rounded"
          width={110}
          height={26}
          sx={{ borderRadius: 1 }}
        />
      </Stack>

      <Skeleton width="70%" height={28} sx={{ mb: 1.5 }} />
      <Skeleton width="85%" height={18} sx={{ mb: 0.5 }} />
      <Skeleton width="45%" height={18} sx={{ mb: 3 }} />

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
        p: { xs: 1.5, sm: 2.5 },
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "#fcfcfc",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ justifyContent: "flex-end", alignItems: "center" }}
      >
        <Skeleton
          variant="rounded"
          height={38}
          sx={{ borderRadius: 2, flex: { xs: 1, sm: "none" }, width: { sm: 120 } }}
        />
        <Skeleton
          variant="rounded"
          height={38}
          sx={{ borderRadius: 2, flex: { xs: 1, sm: "none" }, width: { sm: 130 } }}
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
      <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <ErrorState
          title="Failed to load pending posts"
          subtitle="There was an error connecting to the server."
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  return (
    <Box sx={{ pb: { xs: 4, sm: 8 }, pt: { xs: 2, sm: 4 }, minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: { xs: 2.5, sm: 4 }, display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.5rem", sm: "1.85rem", md: "2.125rem" },
            }}
          >
            Post Moderation
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
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
              p: { xs: 3, sm: 6 },
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
