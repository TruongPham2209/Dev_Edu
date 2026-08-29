"use client";

import type { CategoryResponse } from "@/lib/type/courses";
import { Box, Button, Typography } from "@mui/material";
import { Flame, LayoutGrid } from "lucide-react";

interface CourseCategoriesProps {
  categories: CategoryResponse[];
  selectedCategory: string | null;
  setSelectedCategory: (val: string | null) => void;
}

export const CourseCategories = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CourseCategoriesProps) => {
  return (
    <Box
      sx={{
        mb: { xs: 5, sm: 8 },
        p: { xs: 2, sm: 3 },
        bgcolor: "background.paper",
        borderRadius: { xs: 1, sm: 1.5 },
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 4px 20px -10px rgba(0,0,0,0.5)"
            : "0 4px 20px -10px rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          mb: { xs: 2, sm: 3 },
          color: "text.primary",
        }}
      >
        <LayoutGrid size={20} color="currentColor" style={{ flexShrink: 0 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          Roadmap & Topics
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 1.5 },
          overflowX: "auto",
          pb: 1.5,
          "&::-webkit-scrollbar": { height: 5 },
          "&::-webkit-scrollbar-track": {
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.04)"
                : "#f8fafc",
            borderRadius: 10,
          },
          "&::-webkit-scrollbar-thumb": {
            background: (theme) => theme.palette.divider,
            borderRadius: 10,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: (theme) => theme.palette.text.disabled,
          },
        }}
      >
        <Button
          variant={selectedCategory === null ? "contained" : "outlined"}
          onClick={() => setSelectedCategory(null)}
          disableElevation
          startIcon={<Flame size={16} />}
          sx={{
            flexShrink: 0,
            borderRadius: 12,
            px: { xs: 2, sm: 3 },
            py: { xs: 0.85, sm: 1.2 },
            whiteSpace: "nowrap",
            fontWeight: 700,
            textTransform: "none",
            fontSize: { xs: "0.85rem", sm: "0.95rem" },
            color: selectedCategory === null ? "#fff" : "text.secondary",
            background:
              selectedCategory === null
                ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                : "transparent",
            borderColor: selectedCategory === null ? "transparent" : "divider",
            boxShadow:
              selectedCategory === null
                ? "0 8px 15px -5px rgba(22,163,74,0.3)"
                : "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background:
                selectedCategory === null
                  ? "linear-gradient(135deg, #15803d 0%, #166534 100%)"
                  : "action.hover",
              borderColor:
                selectedCategory === null ? "transparent" : "text.secondary",
              transform: "translateY(-2px)",
              boxShadow:
                selectedCategory === null
                  ? "0 10px 20px -5px rgba(22,163,74,0.4)"
                  : "none",
            },
          }}
        >
          All courses
        </Button>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => setSelectedCategory(cat.id)}
              disableElevation
              sx={{
                flexShrink: 0,
                borderRadius: 12,
                px: { xs: 2, sm: 3 },
                py: { xs: 0.85, sm: 1.2 },
                whiteSpace: "nowrap",
                fontWeight: 600,
                textTransform: "none",
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                color: isActive ? "#fff" : "text.secondary",
                background: isActive
                  ? "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)"
                  : "transparent",
                borderColor: isActive ? "transparent" : "divider",
                boxShadow: isActive
                  ? "0 8px 15px -5px rgba(2,132,199,0.3)"
                  : "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: isActive
                    ? "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)"
                    : "action.hover",
                  borderColor: isActive ? "transparent" : "text.secondary",
                  transform: "translateY(-2px)",
                  boxShadow: isActive
                    ? "0 10px 20px -5px rgba(2,132,199,0.4)"
                    : "none",
                },
              }}
            >
              {cat.name}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};
