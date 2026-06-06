"use client";

import { EmptyState } from "@/components/common/empty-state";
import { LectureResponse } from "@/lib/api/types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { BookOpen, ChevronDown, FileText, PlayCircle } from "lucide-react";

interface CourseContentProps {
  lectures: LectureResponse[];
}

export const CourseContent = ({ lectures }: CourseContentProps) => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            bgcolor: "#eff6ff",
            borderRadius: 3,
            color: "#2563eb",
          }}
        >
          <BookOpen size={28} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Course Content
          </Typography>
          <Typography sx={{ color: "#64748b", mt: 0.5 }}>
            Detailed learning roadmap designed systematically
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 1,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        }}
      >
        {lectures.length > 0 && (
          <Box
            sx={{
              bgcolor: "#f8fafc",
              px: 3,
              py: 2.5,
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                color: "#1e293b",
                fontSize: "1.125rem",
              }}
            >
              Total {lectures.length} lectures
            </Typography>
          </Box>
        )}

        {lectures.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              height: 300,
              borderRadius: 1,
              bgcolor: "#e2e8f0",
            }}
          >
            <EmptyState
              title="No lectures"
              subtitle="This course does not have any lectures yet. Please check back later."
              icon={<BookOpen size={28} />}
            />
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {lectures.map((lecture, index) => (
              <Accordion
                key={lecture.id}
                disableGutters
                elevation={0}
                sx={{
                  "&:before": { display: "none" },
                  bgcolor: "transparent",
                  "&.Mui-expanded": {
                    bgcolor: "#f8fafc",
                  },
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "#f8fafc",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDown size={20} color="#64748b" />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    "& .MuiAccordionSummary-content": { my: 0 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2.5,
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#e0e7ff",
                        color: "#4f46e5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#1e293b",
                        fontSize: "1rem",
                      }}
                    >
                      {lecture.title}
                    </Typography>
                    <Box
                      sx={{
                        ml: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#64748b",
                        fontSize: "0.875rem",
                        mr: 1,
                      }}
                    >
                      {lecture.duration > 0 ? (
                        <>
                          <PlayCircle size={16} />
                          {Math.floor(lecture.duration / 60)}:
                          {String(lecture.duration % 60).padStart(2, "0")}
                        </>
                      ) : (
                        <>
                          <FileText size={16} />
                          Document
                        </>
                      )}
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 4, pt: 0 }}>
                  <Box sx={{ pl: 7 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        lineHeight: 1.7,
                        fontSize: "0.95rem",
                      }}
                    >
                      {lecture.summary ||
                        "No detailed description is available for this lecture. Students can watch the lecture video directly to understand the content."}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};
