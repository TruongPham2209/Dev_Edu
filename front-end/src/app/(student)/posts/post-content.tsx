import { Box } from "@mui/material";

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <Box
      sx={{
        typography: "body1",
        lineHeight: 1.8,
        fontSize: "1.125rem",
        color: "text.primary",
        "& p": { mb: 2 },
        "& img": { maxWidth: "100%", height: "auto", borderRadius: 2, my: 3 },
        "& h1, h2, h3, h4, h5, h6": {
          fontWeight: 700,
          mt: 4,
          mb: 2,
          color: "text.primary",
        },
        "& h2": { fontSize: "1.75rem" },
        "& h3": { fontSize: "1.5rem" },
        "& ul, ol": { mb: 2, pl: 3 },
        "& li": { mb: 1 },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "primary.main",
          pl: 2,
          my: 3,
          color: "text.secondary",
          fontStyle: "italic",
          bgcolor: "action.hover",
          py: 1.5,
          borderRadius: "0 8px 8px 0",
        },
        "& pre": {
          bgcolor: "grey.900",
          color: "grey.100",
          p: 2,
          borderRadius: 2,
          overflowX: "auto",
          my: 3,
          fontSize: "0.875rem",
        },
        "& code": {
          bgcolor: "action.hover",
          color: "secondary.main",
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontFamily: "monospace",
          fontSize: "0.875em",
        },
        "& pre code": {
          bgcolor: "transparent",
          color: "inherit",
          p: 0,
        },
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
