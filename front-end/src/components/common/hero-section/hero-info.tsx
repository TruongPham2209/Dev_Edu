import { alpha, Box, Chip, Stack, Typography } from "@mui/material";
import { Sparkles } from "lucide-react";

interface HeroInfoProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  tags?: string[];
}

export function HeroInfo({ title, description, icon, tags }: HeroInfoProps) {
  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        overflow: "hidden",

        p: { xs: 2.5, sm: 3.5, md: 4 },

        borderRadius: { xs: "20px", sm: "24px" },

        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "background.paper"
            : alpha(theme.palette.success.main, 0.08),

        border: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "dark"
            ? "divider"
            : alpha(theme.palette.success.main, 0.18),

        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 16px 40px rgba(0, 0, 0, 0.4)"
            : `0 16px 40px ${alpha(theme.palette.success.main, 0.08)}`,
      }}
    >
      {/* Glow */}
      <Box
        sx={{
          position: "absolute",
          top: -80,
          right: -80,

          width: { xs: 160, sm: 240 },
          height: { xs: 160, sm: 240 },

          borderRadius: "50%",

          background: (theme) => `
            radial-gradient(
              circle,
              ${alpha(theme.palette.success.main, 0.18)} 0%,
              rgba(34,197,94,0) 72%
            )
          `,
        }}
      />

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={{ xs: 2, lg: 3 }}
        sx={{
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            lg: "center",
          },
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* LEFT */}
        <Box sx={{ flex: { xs: "1", lg: "7" }, width: "100%" }}>
          {/* Badge */}
          <Chip
            icon={<Sparkles size={14} />}
            label="Management Panel"
            size="small"
            sx={{
              mb: 1.5,
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
              color: "success.main",
              fontWeight: 700,
              borderRadius: "999px",
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.success.main, 0.15),
              "& .MuiChip-icon": {
                color: "success.main",
              },
            }}
          />

          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 1.25, sm: 1.5 },
              mb: 1.2,
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: { xs: 42, sm: 48, md: 52 },
                height: { xs: 42, sm: 48, md: 52 },
                borderRadius: { xs: "12px", sm: "16px" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: (theme) => `
                  linear-gradient(
                    135deg,
                    ${alpha(theme.palette.success.main, 0.22)},
                    ${alpha(theme.palette.success.main, 0.14)}
                  )
                `,
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.success.main, 0.15),
                color: "success.main",
                boxShadow: (theme) =>
                  `0 10px 24px ${alpha(theme.palette.success.main, 0.12)}`,
                "& svg": {
                  width: { xs: 22, sm: 24, md: 26 },
                  height: { xs: 22, sm: 24, md: 26 },
                },
              }}
            >
              {icon}
            </Box>

            {/* Title */}
            <Typography
              sx={{
                fontSize: {
                  xs: "1.35rem",
                  sm: "1.75rem",
                  md: "2.25rem",
                  lg: "2.5rem",
                },
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "text.primary",
                wordBreak: "break-word",
              }}
            >
              {title}
            </Typography>
          </Box>

          {/* Desc */}
          <Typography
            sx={{
              maxWidth: 760,
              fontSize: {
                xs: "0.85rem",
                sm: "0.95rem",
                md: "1.05rem",
              },
              lineHeight: 1.6,
              color: "text.secondary",
              wordBreak: "break-word",
              mb: 0,
            }}
          >
            {description}
          </Typography>
        </Box>

        {/* RIGHT */}
        {tags && tags.length > 0 && (
          <Box
            sx={{
              flex: { xs: "1", lg: "3" },
              width: "100%",
              display: "flex",
              alignItems: { xs: "flex-start", lg: "flex-end" },
            }}
          >
            {/* Tags */}
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                flexWrap: "wrap",
                justifyContent: { xs: "flex-start", lg: "flex-end" },
              }}
            >
              {tags.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  size="small"
                  sx={{
                    bgcolor: "action.hover",
                    color: "text.primary",
                    fontWeight: 600,
                    fontSize: { xs: "0.725rem", sm: "0.8125rem" },
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: "divider",
                    backdropFilter: "blur(10px)",
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
