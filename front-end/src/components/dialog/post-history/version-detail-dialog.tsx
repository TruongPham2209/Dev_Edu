import { InfoDialog } from "@/components/common/info-dialog";
import { formatServerDate } from "@/lib/util/date-utils";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { Calendar, FileText } from "lucide-react";
import { getStatusColor } from "../../../lib/util/status-utils";

interface VersionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  selectedVersion: any;
  mode?: "normal" | "manage";
}

export function VersionDetailDialog({
  open,
  onClose,
  selectedVersion,
  mode = "normal",
}: VersionDetailDialogProps) {
  return (
    <InfoDialog
      open={open}
      onClose={onClose}
      title="Version Detail"
      headerIcon={<FileText size={24} />}
      maxWidth="md"
      paperSx={{
        height: "75vh",
        maxHeight: 800,
      }}
    >
      {selectedVersion && (
        <>
          {/* HERO HEADER */}
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 1,
              p: 3,
              mb: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))"
                  : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            }}
          >
            {/* top glow */}
            <Box
              sx={{
                position: "absolute",
                top: -120,
                right: -120,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background: "primary.main",
                opacity: 0.06,
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />

            {/* META */}
            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                mb: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: 0.3,
                  boxShadow: "0 4px 12px rgba(25,118,210,0.25)",
                }}
              >
                VERSION DETAIL
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Calendar size={15} />

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                  }}
                >
                  {formatServerDate(
                    selectedVersion.createdAt || selectedVersion.updatedAt,
                  )}
                </Typography>
              </Box>

              {mode === "manage" && selectedVersion.status && (
                <Chip
                  label={selectedVersion.status}
                  size="small"
                  color={getStatusColor(selectedVersion.status) as any}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    height: 30,
                    "& .MuiChip-label": {
                      px: 1.5,
                    },
                  }}
                />
              )}
            </Stack>

            {/* TITLE */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: -1,
                mb: 2,
                color: "text.primary",
              }}
            >
              {selectedVersion.title}
            </Typography>

            {/* DESCRIPTION */}
            {selectedVersion.shortDescription && (
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.9,
                  fontSize: "1.02rem",
                  maxWidth: 900,
                }}
              >
                {selectedVersion.shortDescription}
              </Typography>
            )}
          </Box>

          {/* CONTENT */}
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
            }}
          >
            {/* top accent */}
            <Box
              sx={{
                height: 4,
                background:
                  "linear-gradient(90deg, rgba(25,118,210,1) 0%, rgba(99,102,241,1) 100%)",
              }}
            />

            <Box
              sx={{
                p: {
                  xs: 2.5,
                  md: 4,
                },

                color: "text.primary",
                lineHeight: 1.9,
                fontSize: "1rem",

                "& h1, & h2, & h3": {
                  fontWeight: 800,
                  lineHeight: 1.3,
                  mt: 4,
                  mb: 2,
                  color: "text.primary",
                  letterSpacing: -0.5,
                },

                "& p": {
                  mb: 2,
                  color: "text.secondary",
                },

                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 3,
                  my: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                },

                "& pre": {
                  overflowX: "auto",
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "grey.950",
                  fontSize: "0.9rem",
                  my: 2,
                },

                "& code": {
                  fontFamily: "monospace",
                },

                "& blockquote": {
                  borderLeft: "4px solid",
                  borderColor: "primary.main",
                  pl: 2,
                  ml: 0,
                  my: 3,
                  color: "text.secondary",
                  fontStyle: "italic",
                  opacity: 0.9,
                },

                "& ul, & ol": {
                  pl: 3,
                  mb: 2,
                },

                "& li": {
                  mb: 1,
                },

                "& a": {
                  color: "primary.main",
                  textDecoration: "none",
                  fontWeight: 600,

                  "&:hover": {
                    textDecoration: "underline",
                  },
                },
              }}
              dangerouslySetInnerHTML={{
                __html: selectedVersion.content || "N/A",
              }}
            />
          </Box>
        </>
      )}
    </InfoDialog>
  );
}
