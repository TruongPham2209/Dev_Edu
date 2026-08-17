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
        position: "relative",
        overflow: "hidden",

        borderRadius: { xs: "20px", sm: "24px", md: "32px" },

        px: { xs: 2.5, sm: 3, md: 4 },
        py: { xs: 2.5, sm: 3, md: 3.5 },

        background: `
          linear-gradient(
            135deg,
            #dcfce7 0%,
            #ecfdf5 45%,
            #f0fdf4 100%
          )
        `,

        border: "1px solid",
        borderColor: alpha("#16a34a", 0.18),

        boxShadow: `
          0 16px 40px rgba(22,101,52,.08),
          0 4px 16px rgba(34,197,94,.08)
        `,
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

          background: `
            radial-gradient(
              circle,
              rgba(34,197,94,.18) 0%,
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

              bgcolor: alpha("#16a34a", 0.1),

              color: "#166534",

              fontWeight: 700,

              borderRadius: "999px",
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },

              border: "1px solid",
              borderColor: alpha("#16a34a", 0.12),

              "& .MuiChip-icon": {
                color: "#16a34a",
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

                background: `
                  linear-gradient(
                    135deg,
                    rgba(22,163,74,.22),
                    rgba(21,128,61,.14)
                  )
                `,

                border: "1px solid",
                borderColor: alpha("#16a34a", 0.15),

                color: "#166534",

                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,.6),
                  0 10px 24px rgba(22,163,74,.12)
                `,

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

                color: "#14532d",

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

              color: alpha("#14532d", 0.82),

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
                    bgcolor: "rgba(255,255,255,.65)",
                    color: "#166534",
                    fontWeight: 600,
                    fontSize: { xs: "0.725rem", sm: "0.8125rem" },
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: alpha("#16a34a", 0.1),
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
