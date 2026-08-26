import ButtonAction from "@/components/common/button-action";
import type { PostResponse } from "@/lib/type/forums";
import { formatServerDate } from "@/lib/util/date-utils";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { Eye, Trash2 } from "lucide-react";
import { getStatusColor } from "../../../lib/util/status-utils";

interface PostVersionListProps {
  versions: PostResponse[];
  mode: "normal" | "manage";
  isMine: boolean;
  onViewVersion: (version: PostResponse) => void;
  onDeleteVersion: (versionId: string) => void;
}

export function PostVersionList({
  versions,
  mode,
  isMine,
  onViewVersion,
  onDeleteVersion,
}: PostVersionListProps) {
  return (
    <Stack spacing={2.25}>
      {versions.map((version, index) => {
        const versionNumber = versions.length - index;

        return (
          <Box
            key={version.id || index}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: "all .28s cubic-bezier(0.4, 0, 0.2, 1)",
              backdropFilter: "blur(10px)",

              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                bgcolor:
                  version.status === "APPROVED"
                    ? "success.main"
                    : version.status === "REJECTED"
                      ? "error.main"
                      : "warning.main",
                transition: "all .25s ease",
              },

              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: "primary.main",
                boxShadow:
                  "0 12px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",

                "& .version-actions": {
                  opacity: 1,
                  transform: "translateX(0)",
                },

                "&::before": {
                  width: 6,
                },
              },
            }}
          >
            <Box
              sx={{
                p: { xs: 1.75, sm: 2.5 },
                pl: { xs: 2.25, sm: 3 },
              }}
            >
              {/* HEADER */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 1, sm: 2 },
                  mb: 1.5,
                }}
              >
                {/* LEFT */}
                <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 0.75, sm: 1.25 }}
                    sx={{ alignItems: { xs: "flex-start", sm: "center" }, flexWrap: "wrap" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.2,
                          py: 0.4,
                          borderRadius: 2,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          fontWeight: 700,
                          fontSize: 12,
                          letterSpacing: 0.3,
                          boxShadow: "0 4px 12px rgba(25,118,210,0.25)",
                          flexShrink: 0,
                        }}
                      >
                        v{versionNumber}
                      </Box>

                      {mode === "manage" && version.status && (
                        <Chip
                          label={version.status}
                          size="small"
                          color={getStatusColor(version.status)}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            height: 24,
                            fontSize: "0.75rem",
                            "& .MuiChip-label": {
                              px: 1,
                            },
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        letterSpacing: -0.2,
                        fontSize: { xs: "0.95rem", sm: "1.05rem" },
                        lineHeight: 1.3,
                        wordBreak: "break-word",
                      }}
                    >
                      {version.title || `Post Version ${versionNumber}`}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 500,
                        fontSize: { xs: "0.75rem", sm: "0.8rem" },
                      }}
                    >
                      {formatServerDate(version.createdAt || version.updatedAt)}
                    </Typography>
                  </Stack>
                </Stack>

                {/* ACTIONS */}
                <Stack
                  direction="row"
                  spacing={0.5}
                  className="version-actions"
                  sx={{
                    opacity: { xs: 1, md: 0 },
                    transform: { xs: "none", md: "translateX(8px)" },
                    transition: "all .25s ease",
                    flexShrink: 0,
                  }}
                >
                  <ButtonAction
                    icon={<Eye size={18} />}
                    tooltip="View details"
                    variant="soft"
                    color="primary"
                    onClick={() => onViewVersion(version)}
                  />

                  {mode === "manage" &&
                    isMine &&
                    version.status === "PENDING" && (
                      <ButtonAction
                        icon={<Trash2 size={18} />}
                        tooltip="Delete version"
                        variant="soft"
                        color="error"
                        onClick={() => onDeleteVersion(version.id)}
                      />
                    )}
                </Stack>
              </Box>

              {/* CONTENT */}
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 1,
                  px: 2,
                  py: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "grey.50",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.75,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",

                    "& p": {
                      m: 0,
                    },

                    "& img": {
                      display: "none",
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      version.content ||
                      version.shortDescription ||
                      version.title ||
                      "N/A",
                  }}
                />

                {/* fade */}
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 40,
                    background:
                      "linear-gradient(to bottom, transparent, background.paper)",
                    pointerEvents: "none",
                  }}
                />
              </Box>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
