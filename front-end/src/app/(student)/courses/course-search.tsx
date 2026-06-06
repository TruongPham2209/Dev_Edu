"use client";

import { SearchInput } from "@/components/common/form/search-input";
import { Box, Chip, Typography } from "@mui/material";
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
    <Box sx={{ mb: { xs: 6, md: 8 }, px: { xs: 0, sm: 2 } }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
          }}
        >
          <Search size={28} color="#38bdf8" /> What do you want to learn today?
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
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
          gap: 1.5,
          mt: 3,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
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
              bgcolor: "#f1f5f9",
              color: "#475569",
              fontWeight: 600,
              border: "1px solid transparent",
              "&:hover": {
                bgcolor: "#e0f2fe",
                color: "#0369a1",
                borderColor: "#bae6fd",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
