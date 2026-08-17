import { InfoDialog } from "@/components/common/info-dialog";
import { formatServerDate } from "@/lib/util/date-utils";
import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
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
        height: { xs: "85vh", sm: "75vh" },
        maxHeight: 800,
      }}
    >
      {selectedVersion && (
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          {/* HERO HEADER */}
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 1,
              p: { xs: 2, sm: 3 },
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
              spacing={1}
              sx={{
                mb: { xs: 1.5, sm: 2 },
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  fontSize: { xs: 11, sm: 13 },
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
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Calendar size={14} />

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
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
                    height: 26,
                    fontSize: "0.75rem",
                    "& .MuiChip-label": {
                      px: 1.2,
                    },
                  }}
                />
              )}
            </Stack>

            {/* AUTHOR DETAILS IF PRESENT */}
            {(selectedVersion.authorFullName || selectedVersion.authorUsername) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
                <Avatar
                  src={selectedVersion.authorAvatarUrl || undefined}
                  sx={{ width: 32, height: 32, fontSize: "0.85rem", bgcolor: "#0ea5e9", fontWeight: 700 }}
                >
                  {(selectedVersion.authorFullName || selectedVersion.authorUsername || "U").charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
                    {selectedVersion.authorFullName || selectedVersion.authorUsername}
                  </Typography>
                  {selectedVersion.authorUsername && selectedVersion.authorFullName && (
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                      @{selectedVersion.authorUsername}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* TITLE */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: -0.5,
                mb: { xs: 1, sm: 1.5 },
                color: "text.primary",
                fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.1rem" },
                wordBreak: "break-word",
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
                  lineHeight: 1.7,
                  fontSize: { xs: "0.875rem", sm: "1.02rem" },
                  maxWidth: 900,
                  mb: selectedVersion.thumbUrl ? 2 : 0,
                }}
              >
                {selectedVersion.shortDescription}
              </Typography>
            )}

            {/* THUMBNAIL COVER IMAGE */}
            {selectedVersion.thumbUrl && (
              <Box
                sx={{
                  width: "100%",
                  maxHeight: { xs: 200, sm: 320 },
                  borderRadius: 2,
                  overflow: "hidden",
                  mt: 1.5,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#f8fafc",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedVersion.thumbUrl}
                  alt={selectedVersion.title || "Post thumbnail"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </Box>
            )}

            {/* REJECTION REASON BANNER */}
            {(selectedVersion.rejectionReason || selectedVersion.reason || selectedVersion.note) && (
              <Box
                sx={{
                  p: 2,
                  mt: 2,
                  borderRadius: 2,
                  bgcolor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Rejection Reason:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                  {selectedVersion.rejectionReason || selectedVersion.reason || selectedVersion.note}
                </Typography>
              </Box>
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
        </Stack>
      )}
    </InfoDialog>
  );
}
