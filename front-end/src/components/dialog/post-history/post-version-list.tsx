import ButtonAction from "@/components/common/button-action";
import { formatServerDate } from "@/lib/util/date-utils";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { Eye, Trash2 } from "lucide-react";
import { getStatusColor } from "../../../lib/util/status-utils";

interface PostVersionListProps {
  versions: any[];
  mode: "normal" | "manage";
  isMine: boolean;
  onViewVersion: (version: any) => void;
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
                p: 2.5,
                pl: 3,
              }}
            >
              {/* HEADER */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 2,
                }}
              >
                {/* LEFT */}
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        px: 1.4,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: 0.3,
                        boxShadow: "0 4px 12px rgba(25,118,210,0.25)",
                      }}
                    >
                      v{versionNumber}
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        letterSpacing: -0.2,
                      }}
                    >
                      {version.title || `Post Version ${versionNumber}`}
                    </Typography>

                    {mode === "manage" && version.status && (
                      <Chip
                        label={version.status}
                        size="small"
                        color={getStatusColor(version.status) as any}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          height: 26,
                          "& .MuiChip-label": {
                            px: 1.2,
                          },
                        }}
                      />
                    )}
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
                      }}
                    >
                      {formatServerDate(version.createdAt || version.updatedAt)}
                    </Typography>
                  </Stack>
                </Stack>

                {/* ACTIONS */}
                <Stack
                  direction="row"
                  spacing={1}
                  className="version-actions"
                  sx={{
                    opacity: 0,
                    transform: "translateX(8px)",
                    transition: "all .25s ease",
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
