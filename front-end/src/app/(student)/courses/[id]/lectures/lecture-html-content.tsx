"use client";

import { Box, alpha } from "@mui/material";

interface LectureHTMLContentProps {
  content: string;
}

export function LectureHTMLContent({ content }: LectureHTMLContentProps) {
  return (
    <Box
      sx={{
        wordBreak: "break-word",
        "& h1, & h2, & h3": {
          fontWeight: 800,
          mt: { xs: 2.5, sm: 4 },
          mb: { xs: 1.5, sm: 2 },
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
        },
        "& h1": { fontSize: { xs: "1.3rem", sm: "1.75rem" } },
        "& h2": { fontSize: { xs: "1.15rem", sm: "1.45rem" } },
        "& h3": { fontSize: { xs: "1.05rem", sm: "1.25rem" } },
        "& p": {
          lineHeight: { xs: 1.7, sm: 1.8 },
          mb: { xs: 1.5, sm: 2.5 },
          color: "text.primary",
          fontSize: { xs: "0.925rem", sm: "1.05rem" },
        },
        "& img": {
          maxWidth: "100%",
          borderRadius: { xs: 1, sm: 1.5 },
          my: { xs: 1.5, sm: 2 },
          boxShadow: (theme) =>
            `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
        },
        "& code": {
          bgcolor: "action.hover",
          p: 0.5,
          borderRadius: 1,
          fontFamily: "monospace",
          fontSize: "0.875em",
          color: "primary.main",
        },
        "& pre": {
          bgcolor: "grey.900",
          color: "grey.100",
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1.5,
          overflowX: "auto",
          my: { xs: 1.5, sm: 2 },
          fontSize: { xs: "0.8rem", sm: "0.875rem" },
          "& code": {
            bgcolor: "transparent",
            p: 0,
            color: "inherit",
          },
        },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "primary.main",
          pl: { xs: 1.5, sm: 2 },
          py: 0.5,
          my: { xs: 1.5, sm: 2 },
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
          borderRadius: 1,
          fontStyle: "italic",
        },
        "& ul, & ol": {
          pl: { xs: 2.5, sm: 4 },
          mb: 3,
          "& li": {
            mb: 1,
            lineHeight: 1.7,
            fontSize: { xs: "0.9rem", sm: "1rem" },
          },
        },
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
