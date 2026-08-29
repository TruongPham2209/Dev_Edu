"use client";

import { SearchInput } from "@/components/common/form/search-input";
import { alpha, Box, Chip, Typography } from "@mui/material";
import { Search, TrendingUp } from "lucide-react";

interface CourseSearchProps {
  searchKeyword: string;
  setSearchKeyword: (val: string) => void;
  setDebouncedKeyword: (val: string) => void;
}

export const CourseSearch = ({
  searchKeyword,
  setSearchKeyword,
  setDebouncedKeyword,
}: CourseSearchProps) => {
  return (
    <>
      {/* Title */}
      <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 }, px: { xs: 0, sm: 2 } }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1, sm: 1.5 },
            fontSize: { xs: "1.2rem", sm: "1.5rem" },
            lineHeight: 1.3,
          }}
        >
          <Search size={24} color="#38bdf8" style={{ flexShrink: 0 }} /> What do
          you want to learn today?
        </Typography>
      </Box>

      {/* Sticky Search Input Wrapper - Direct Child of Page Stack */}
      <Box
        sx={{
          position: "sticky",
          top: { xs: 72, sm: 76 },
          zIndex: 100,
          py: 1,
          px: { xs: 1, sm: 2 },
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.9),
          backdropFilter: "blur(12px)",
          borderRadius: 4,
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 20px -5px rgba(0, 0, 0, 0.4)"
              : "0 4px 20px -5px rgba(15, 23, 42, 0.05)",
          transition: "all 0.3s ease",
          mb: { xs: 2, sm: 2.5 },
        }}
      >
        <SearchInput
          placeholder="Search by skills, languages, or topics (e.g., React, Python...)"
          value={searchKeyword}
          onChange={setSearchKeyword}
          onSearch={setDebouncedKeyword}
          maxWidth={800}
        />
      </Box>

      {/* Quick Suggestion Tags */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: { xs: 1, sm: 1.5 },
          mb: { xs: 4, sm: 6, md: 8 },
          px: { xs: 0, sm: 2 },
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
          }}
        >
          Trends:
        </Typography>
        {[
          "ReactJS",
          "Next.js 14",
          "Python cho Data Science",
          "UI/UX Design",
        ].map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onClick={() => {
              setSearchKeyword(tag);
              setDebouncedKeyword(tag);
            }}
            size="small"
            icon={<TrendingUp size={12} />}
            sx={{
              bgcolor: "action.hover",
              color: "text.primary",
              fontWeight: 600,
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                bgcolor: (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.2 : 0.1,
                  ),
                color: "primary.main",
                borderColor: "primary.main",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s",
            }}
          />
        ))}
      </Box>
    </>
  );
};
