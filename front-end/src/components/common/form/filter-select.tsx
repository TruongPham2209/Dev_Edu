import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export interface FilterItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

interface FilterSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  items: FilterItem[];
  defaultLabel?: string;
  defaultValue?: string;
  disabled?: boolean;
}

export function FilterSelect({
  label = "Filter",
  value,
  onChange,
  items,
  defaultLabel,
  defaultValue = "ALL",
  disabled = false,
}: FilterSelectProps) {
  return (
    <FormControl
      disabled={disabled}
      sx={{
        width: { xs: "100%", md: 240 },

        "& .MuiOutlinedInput-root": {
          height: 56,

          borderRadius: "999px",

          background: "rgba(255,255,255,0.82)",

          backdropFilter: "blur(14px)",

          boxShadow: "0 4px 20px rgba(15,23,42,.05)",

          transition: "all .25s cubic-bezier(.4,0,.2,1)",

          "& fieldset": {
            borderColor: "rgba(203,213,225,.7)",
            transition: "all .25s cubic-bezier(.4,0,.2,1)",
          },

          "&:hover fieldset": {
            borderColor: "rgba(148,163,184,.9)",
          },

          "&:hover": {
            boxShadow: "0 8px 24px rgba(15,23,42,.08)",
          },

          "&.Mui-focused fieldset": {
            borderColor: "rgba(37,99,235,.35)",
            borderWidth: "1px",
          },

          "&.Mui-focused": {
            boxShadow: "0 10px 28px rgba(37,99,235,.10)",
            transform: "translateY(-1px)",
          },
        },
      }}
    >
      <InputLabel
        sx={{
          fontSize: "0.95rem",

          fontWeight: 600,

          color: "#64748b",

          "&.Mui-focused": {
            color: "#2563eb",
          },
        }}
      >
        {label}
      </InputLabel>

      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        renderValue={(selected) => {
          if (selected === defaultValue) {
            return (
              <Box
                component="span"
                sx={{
                  color: "#94a3b8",
                  fontWeight: 500,
                }}
              >
                {defaultLabel}
              </Box>
            );
          }

          return items.find((item) => item.id === selected)?.title || "";
        }}
        IconComponent={(props) => (
          <Box
            component="span"
            {...props}
            sx={{
              right: "18px !important",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
              fontSize: 18,
            }}
          >
            ⌄
          </Box>
        )}
        sx={{
          height: 56,

          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",

            px: "20px !important",

            fontSize: "0.95rem",

            fontWeight: 600,

            color: "#0f172a",
          },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              elevation: 0,
              sx: {
                mt: 1,

                borderRadius: "20px",

                border: "1px solid rgba(203,213,225,.7)",

                background: "rgba(255,255,255,.92)",

                backdropFilter: "blur(20px)",

                boxShadow: "0 20px 60px rgba(15,23,42,.10)",

                overflow: "hidden",

                "& .MuiMenuItem-root": {
                  minHeight: 44,

                  borderRadius: "12px",

                  mx: 0.75,
                  my: 0.25,

                  fontSize: "0.94rem",

                  fontWeight: 600,

                  transition: "all .18s ease",

                  "&:hover": {
                    background: "rgba(37,99,235,.06)",
                  },

                  "&.Mui-selected": {
                    background: "rgba(37,99,235,.10)",
                    color: "#2563eb",

                    "&:hover": {
                      background: "rgba(37,99,235,.14)",
                    },
                  },
                },
              },
            },
          },
        }}
      >
        {defaultLabel && (
          <MenuItem
            value={defaultValue}
            sx={{
              color: "#94a3b8",

              "&.Mui-selected": {
                color: "#64748b",
                background: "rgba(148,163,184,.08)",
              },

              "&.Mui-selected:hover": {
                background: "rgba(148,163,184,.12)",
              },
            }}
          >
            {defaultLabel}
          </MenuItem>
        )}

        {items.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item.icon && (
              <Box
                component="span"
                sx={{ mr: 1, display: "flex", alignItems: "center" }}
              >
                {item.icon}
              </Box>
            )}
            {item.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
