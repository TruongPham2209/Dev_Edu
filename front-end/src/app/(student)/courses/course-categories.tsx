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
        bgcolor: "#ffffff",
        borderRadius: { xs: 3, sm: 4 },
        boxShadow: "0 4px 20px -10px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.02)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          mb: { xs: 2, sm: 3 },
        }}
      >
        <LayoutGrid size={20} color="#0f172a" style={{ flexShrink: 0 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "#0f172a",
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
            background: "#f8fafc",
            borderRadius: 10,
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#cbd5e1",
            borderRadius: 10,
          },
          "&::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" },
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
            color: selectedCategory === null ? "#fff" : "#475569",
            background:
              selectedCategory === null
                ? "linear-gradient(135deg, #0f172a 0%, #334155 100%)"
                : "transparent",
            borderColor: selectedCategory === null ? "transparent" : "#e2e8f0",
            boxShadow:
              selectedCategory === null
                ? "0 8px 15px -5px rgba(15,23,42,0.3)"
                : "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background:
                selectedCategory === null
                  ? "linear-gradient(135deg, #1e293b 0%, #475569 100%)"
                  : "#f8fafc",
              borderColor:
                selectedCategory === null ? "transparent" : "#cbd5e1",
              transform: "translateY(-2px)",
              boxShadow:
                selectedCategory === null
                  ? "0 10px 20px -5px rgba(15,23,42,0.4)"
                  : "0 4px 10px -5px rgba(0,0,0,0.05)",
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
                color: isActive ? "#fff" : "#475569",
                background: isActive
                  ? "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)"
                  : "transparent",
                borderColor: isActive ? "transparent" : "#e2e8f0",
                boxShadow: isActive
                  ? "0 8px 15px -5px rgba(2,132,199,0.3)"
                  : "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: isActive
                    ? "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)"
                    : "#f8fafc",
                  borderColor: isActive ? "transparent" : "#cbd5e1",
                  transform: "translateY(-2px)",
                  boxShadow: isActive
                    ? "0 10px 20px -5px rgba(2,132,199,0.4)"
                    : "0 4px 10px -5px rgba(0,0,0,0.05)",
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
