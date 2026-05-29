import { EmptyState } from "@/components/common/empty-state";
import { getForumPostById } from "@/lib/api/forum";
import { Box, Container, Grid } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PostComments } from "./post-comments";
import { PostContent } from "./post-content";
import { PostHeader } from "./post-header";
import { RelatedPostsSidebar } from "./related-posts-sidebar";
import { PostDetailSkeleton } from "./skeletons";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PostDetailPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const postId =
    typeof searchParams.id === "string" ? searchParams.id : undefined;

  if (!postId) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <EmptyState
            title="Post Not Found"
            subtitle="Invalid path or missing post ID."
          />
          <Link
            href="/forum"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "8px 22px",
              borderRadius: "999px",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              marginTop: "16px",
              gap: "8px",
              transition:
                "background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
            }}
          >
            <ArrowLeft size={18} />
            Back to Forum
          </Link>
        </Box>
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
    return <ErrorPageContent />;
  }

  if (!post) {
    return <ErrorPageContent />;
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
          <Suspense
            fallback={
              <Box
                sx={{
                  position: { xs: "static", md: "sticky" },
                  top: { md: 88 },
                }}
              >
                Loading related posts...
              </Box>
            }
          >
            <RelatedPostsSidebar postId={postId} />
          </Suspense>
        </Grid>
      </Grid>
    </Container>
  );
}

function ErrorPageContent() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <EmptyState
          title="Post Not Found"
          subtitle="Invalid path or missing post ID."
        />
        <Link
          href="/forum"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "8px 22px",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            marginTop: "16px",
            gap: "8px",
            transition:
              "background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
          }}
        >
          <ArrowLeft size={18} />
          Back to Forum
        </Link>
      </Box>
    </Container>
  );
}
