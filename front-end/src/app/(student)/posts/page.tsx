import { Suspense } from "react";
import { Container, Grid, Stack, Box } from "@mui/material";
import { getForumPostById } from "@/lib/api/forum";
import { PostHeader } from "./_components/post-header";
import { PostContent } from "./_components/post-content";
import { PostComments } from "./_components/post-comments";
import { RelatedPostsSidebar } from "./_components/related-posts-sidebar";
import { PostDetailSkeleton } from "./_components/skeletons";
import { EmptyState } from "@/components/common/empty-state";
import { FileQuestion } from "lucide-react";

export const metadata = {
  title: "Chi tiết bài viết",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PostDetailPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const postId = typeof searchParams.id === "string" ? searchParams.id : undefined;

  if (!postId) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <EmptyState 
          title="Không tìm thấy bài viết" 
          subtitle="Đường dẫn không hợp lệ hoặc thiếu mã bài viết."
        />
      </Container>
    );
  }

  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <PostDetailContent postId={postId} />
    </Suspense>
  );
}

async function PostDetailContent({ postId }: { postId: string }) {
  let post;
  try {
    post = await getForumPostById(postId);
  } catch (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <EmptyState 
          title="Không tìm thấy bài viết" 
          subtitle="Bài viết không tồn tại hoặc đã bị xóa."
        />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <EmptyState 
          title="Không tìm thấy bài viết" 
          subtitle="Bài viết không tồn tại hoặc đã bị xóa."
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={6}>
        {/* Left Side: Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ pr: { md: 2 } }}>
            <PostHeader post={post} />
            <PostContent content={post.content || ""} />
            <PostComments postId={postId} />
          </Box>
        </Grid>

        {/* Right Side: Related Posts Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Suspense fallback={<Box sx={{ position: { xs: 'static', md: 'sticky' }, top: { md: 88 } }}>Đang tải bài viết liên quan...</Box>}>
            <RelatedPostsSidebar postId={postId} />
          </Suspense>
        </Grid>
      </Grid>
    </Container>
  );
}
