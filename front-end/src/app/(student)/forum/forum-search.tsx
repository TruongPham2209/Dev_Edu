"use client";

import {
  alpha,
  Box,
  Button,
  Chip,
  Fade,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Search } from "lucide-react";
import { useState } from "react";

interface ForumSearchProps {
  keyword: string;
  onChangeKeyword: (keyword: string) => void;
  onSearch: (keyword: string) => void;
}

const POPULAR_TAGS = ["React", "Spring Boot", "Clean Architecture", "AI Tools"];

export function ForumSearch({
  keyword,
  onChangeKeyword,
  onSearch,
}: ForumSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      {/* Sticky Search Input Bar Only */}
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
          boxShadow: "0 4px 20px -5px rgba(15, 23, 42, 0.05)",
          transition: "all 0.3s ease",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search topics, questions, tutorials..."
          value={keyword}
          onChange={(e) => onChangeKeyword(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search
                    size={20}
                    color={isFocused ? "#0284c7" : "#94a3b8"}
                    style={{ transition: "color 0.3s", marginLeft: 4 }}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <Fade in={keyword.length > 0}>
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      size="small"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSearch(keyword)}
                      sx={{
                        borderRadius: 50,
                        textTransform: "none",
                        fontWeight: 700,
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 0.5, sm: 0.75 },
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        bgcolor: "#0ea5e9",
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#0284c7", boxShadow: "none" },
                      }}
                    >
                      Search
                    </Button>
                  </InputAdornment>
                </Fade>
              ),
            },
          }}
          sx={{
            maxWidth: 700,
            "& .MuiOutlinedInput-root": {
              borderRadius: 50,
              backgroundColor: "#ffffff",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
              padding: { xs: "4px 6px 4px 10px", sm: "6px 8px 6px 16px" },
              boxShadow: isFocused
                ? "0 15px 30px -10px rgba(14, 165, 233, 0.2)"
                : "0 8px 20px -8px rgba(15, 23, 42, 0.08)",
              border: "1px solid #e2e8f0",
              "& fieldset": { borderColor: "transparent" },
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 12px 25px -8px rgba(15, 23, 42, 0.1)",
                "& fieldset": { borderColor: "transparent" },
              },
              "&.Mui-focused": {
                transform: "translateY(-2px)",
                "& fieldset": {
                  borderColor: "#38bdf8",
                  borderWidth: 2,
                },
              },
            },
          }}
        />
      </Box>

      {/* Static Popular Suggestion Tags (Scrolls Away) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: { xs: 0.75, sm: 1 },
          mt: { xs: 1.5, sm: 2 },
          mb: { xs: 3, sm: 4, md: 5 },
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            mr: 0.5,
            fontSize: { xs: "0.75rem", sm: "0.8rem" },
          }}
        >
          Popular:
        </Typography>
        {POPULAR_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onClick={() => onSearch(tag)}
            size="small"
            sx={{
              bgcolor: "#f1f5f9",
              color: "#475569",
              fontWeight: 600,
              fontSize: { xs: "0.725rem", sm: "0.75rem" },
              "&:hover": { bgcolor: "#e0f2fe", color: "#0369a1" },
            }}
          />
        ))}
      </Box>
    </>
  );
}
