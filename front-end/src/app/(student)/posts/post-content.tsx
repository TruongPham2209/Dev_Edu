import { Box } from "@mui/material";

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <Box
      sx={{
        typography: "body1",
        lineHeight: { xs: 1.7, sm: 1.8 },
        fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.125rem" },
        color: "text.primary",
        wordBreak: "break-word",
        "& p": { mb: 2 },
        "& img": { maxWidth: "100%", height: "auto", borderRadius: { xs: 1.5, sm: 2 }, my: { xs: 2, sm: 3 } },
        "& h1, h2, h3, h4, h5, h6": {
          fontWeight: 800,
          mt: { xs: 2.5, sm: 4 },
          mb: { xs: 1.5, sm: 2 },
          color: "text.primary",
          lineHeight: 1.3,
        },
        "& h1": { fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.1rem" } },
        "& h2": { fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.75rem" } },
        "& h3": { fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" } },
        "& ul, ol": { mb: 2, pl: { xs: 2.5, sm: 3 } },
        "& li": { mb: 1 },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "primary.main",
          pl: { xs: 1.5, sm: 2 },
          my: { xs: 2, sm: 3 },
          color: "text.secondary",
          fontStyle: "italic",
          bgcolor: "action.hover",
          py: { xs: 1, sm: 1.5 },
          borderRadius: "0 8px 8px 0",
        },
        "& pre": {
          bgcolor: "grey.900",
          color: "grey.100",
          p: { xs: 1.5, sm: 2 },
          borderRadius: { xs: 1.5, sm: 2 },
          overflowX: "auto",
          my: { xs: 2, sm: 3 },
          fontSize: { xs: "0.8rem", sm: "0.875rem" },
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
