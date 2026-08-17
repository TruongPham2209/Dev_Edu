import { getForumFeed } from "@/lib/api/forum";
import { formatServerDate } from "@/lib/util/date-utils";
import { Box, Skeleton, Typography } from "@mui/material";
import Link from "next/link";
import { ErrorState } from "@/components/common/error-state";
import type { PostResponse } from "@/lib/type/forums";

export async function FeaturedArticlesSection() {
  let articles: PostResponse[] = [];
  try {
    const data = await getForumFeed();
    articles = data?.contents || [];
  } catch (error) {
    console.error("Failed to fetch featured articles:", error);
    return (
      <ErrorState
        title="Failed to load featured articles"
        subtitle="Please try again later"
      />
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
        gap: { xs: 2.5, sm: 3, md: 4 },
      }}
    >
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/posts?id=${article.id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 3 },
              p: { xs: 1.75, sm: 2 },
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
              bgcolor: "#ffffff",
              height: "100%",
            }}
          >
            <Box
              component="img"
              src={
                article.thumbUrl ||
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80"
              }
              sx={{
                width: { xs: "100%", sm: 200, md: 220 },
                height: { xs: 160, sm: 130 },
                objectFit: "cover",
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: 0,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  lineHeight: 1.4,
                }}
              >
                {article.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 2,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                }}
              >
                {article.shortDescription}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.disabled",
                  fontWeight: 500,
                  mt: "auto",
                }}
              >
                {formatServerDate(article.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Link>
      ))}
    </Box>
  );
}

export function FeaturedArticlesFallback() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
        gap: { xs: 2.5, sm: 3, md: 4 },
      }}
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 3 },
            p: { xs: 1.75, sm: 2 },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            height: "100%",
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: { xs: "100%", sm: 200, md: 220 },
              height: { xs: 160, sm: 130 },
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
            }}
          >
            <Skeleton variant="text" width="90%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
            <Skeleton
              variant="text"
              width="40%"
              height={16}
              sx={{ mt: "auto" }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
