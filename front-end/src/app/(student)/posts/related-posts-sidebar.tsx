import { PostCard } from "@/components/card/post-card";
import { EmptyState } from "@/components/common/empty-state";
import { getRelatedPosts } from "@/lib/api/forum";
import type { PostResponse } from "@/lib/type/forums";
import { Box, Stack, Typography } from "@mui/material";

interface RelatedPostsSidebarProps {
  postId: string;
}

export async function RelatedPostsSidebar({
  postId,
}: RelatedPostsSidebarProps) {
  let relatedPosts: PostResponse[] = [];
  try {
    relatedPosts = await getRelatedPosts(postId);
  } catch {
    relatedPosts = [];
  }

  return (
    <Box
      sx={{
        position: { xs: "static", md: "sticky" },
        top: { md: 88 }, // Adjust based on header height
        alignSelf: "start",
        pb: { xs: 2, sm: 4 },
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: { xs: 2, sm: 3 }, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
        Related Posts
      </Typography>

      {relatedPosts.length === 0 ? (
        <EmptyState title="No related posts" />
      ) : (
        <Stack spacing={2}>
          {relatedPosts.map((item) => (
            <PostCard key={item.id} post={item} showStatus={false} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
