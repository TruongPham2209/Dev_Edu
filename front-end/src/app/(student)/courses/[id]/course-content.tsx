"use client";

import { EmptyState } from "@/components/common/empty-state";
import type { LectureResponse } from "@/lib/type/lectures";
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
          gap: { xs: 1.25, sm: 2 },
          mb: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            bgcolor: "#eff6ff",
            borderRadius: 3,
            color: "#2563eb",
            display: "flex",
            flexShrink: 0,
          }}
        >
          <BookOpen size={24} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
            }}
          >
            Course Content
          </Typography>
          <Typography
            sx={{
              color: "#64748b",
              mt: 0.5,
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
            }}
          >
            Detailed learning roadmap designed systematically
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        }}
      >
        {lectures.length > 0 && (
          <Box
            sx={{
              bgcolor: "#f8fafc",
              px: { xs: 2, sm: 3 },
              py: { xs: 1.75, sm: 2.5 },
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
                fontSize: { xs: "0.95rem", sm: "1.125rem" },
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
              height: 260,
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
                  expandIcon={<ChevronDown size={18} color="#64748b" />}
                  sx={{
                    px: { xs: 1.5, sm: 2.5, md: 3 },
                    py: { xs: 1.25, sm: 1.75 },
                    "& .MuiAccordionSummary-content": {
                      my: 0,
                      width: "100%",
                      overflow: "hidden",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: { xs: 1.25, sm: 2 },
                      width: "100%",
                      pr: { xs: 0.5, sm: 1 },
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 30, sm: 34 },
                        height: { xs: 30, sm: 34 },
                        borderRadius: "10px",
                        bgcolor: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        flexShrink: 0,
                        mt: { xs: 0.25, sm: 0 },
                      }}
                    >
                      {index + 1}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: { xs: "0.875rem", sm: "0.975rem" },
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                        }}
                      >
                        {lecture.title}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        bgcolor: "#f1f5f9",
                        color: "#64748b",
                        px: { xs: 1, sm: 1.25 },
                        py: 0.5,
                        borderRadius: "16px",
                        fontSize: { xs: "0.725rem", sm: "0.8rem" },
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {lecture.duration > 0 ? (
                        <>
                          <PlayCircle size={14} color="#0ea5e9" />
                          {Math.floor(lecture.duration / 60)}:
                          {String(lecture.duration % 60).padStart(2, "0")}
                        </>
                      ) : (
                        <>
                          <FileText size={14} color="#6366f1" />
                          Document
                        </>
                      )}
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: { xs: 1.5, sm: 2.5, md: 3 },
                    pb: { xs: 2, sm: 3 },
                    pt: 0,
                  }}
                >
                  <Box
                    sx={{
                      ml: { xs: 0, sm: 5.25 },
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: "10px",
                      bgcolor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderLeft: "3px solid #6366f1",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#475569",
                        lineHeight: 1.7,
                        fontSize: { xs: "0.825rem", sm: "0.9rem" },
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
